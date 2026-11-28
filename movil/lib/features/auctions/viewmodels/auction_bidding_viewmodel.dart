
import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../data/repositories/auction_repository.dart';
import '../models/auction_bid_model.dart';

enum AuctionRealtimeStatus {
  connecting,
  connected,
  reconnecting,
  disconnected,
}

class AuctionBiddingViewModel extends ChangeNotifier {
  final AuctionRepository _repository;
  final SupabaseClient _supabase;
  final String auctionId;

  AuctionBiddingViewModel({
    required this._repository,
    required this._supabase,
    required this.auctionId,
  });

  // ============================================================
  // HISTORIAL DE PUJAS
  // ============================================================

  final List<AuctionBidModel> _bids = [];

  List<AuctionBidModel> get bids => List.unmodifiable(_bids);

  bool _historyLoading = false;
  bool get historyLoading => _historyLoading;

  String? _historyError;
  String? get historyError => _historyError;

  bool _hasLoadedHistory = false;
  bool _historyRequestInProgress = false;

  // ============================================================
  // REALTIME
  // ============================================================

  AuctionRealtimeStatus _realtimeStatus =
      AuctionRealtimeStatus.connecting;

  AuctionRealtimeStatus get realtimeStatus => _realtimeStatus;

  String? _lastRealtimeBidId;
  String? get lastRealtimeBidId => _lastRealtimeBidId;

  RealtimeChannel? _channel;

  // ============================================================
  // ENVÍO Y SEGUIMIENTO DE PUJAS
  // ============================================================

  bool _isSubmittingBid = false;
  bool get isSubmittingBid => _isSubmittingBid;

  String? _bidRequestId;
  String? get bidRequestId => _bidRequestId;

  String? _bidRequestStatus;
  String? get bidRequestStatus => _bidRequestStatus;

  String? _bidMessage;
  String? get bidMessage => _bidMessage;

  bool _statusRequestInProgress = false;

  bool get isBidPending =>
      _bidRequestStatus == 'queued' ||
      _bidRequestStatus == 'processing';

  bool get canSubmitBid =>
      !_isSubmittingBid && !isBidPending;

  bool get bidAccepted => _bidRequestStatus == 'accepted';

  bool get bidRejected => _bidRequestStatus == 'rejected';

  bool get bidExpired => _bidRequestStatus == 'expired';

  static const Duration _pollingInterval =
      Duration(milliseconds: 800);

  static const int _maxPollingAttempts = 45;

  // ============================================================
  // ESTADO GENERAL
  // ============================================================

  bool _disposed = false;

  String? get currentUserId => _supabase.auth.currentUser?.id;

  bool isOwnBid(AuctionBidModel bid) {
    return currentUserId != null &&
        bid.bidderId == currentUserId;
  }

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================

  Future<void> initialize() async {
    debugPrint('========== BID INITIALIZATION ==========');
    debugPrint('Auction ID: $auctionId');

    await _subscribeToBids();
    await refreshHistory();

    debugPrint('========================================');
  }

  // ============================================================
  // HISTORIAL
  // ============================================================

  Future<void> refreshHistory() async {
    if (_disposed ||
        auctionId.isEmpty ||
        _historyRequestInProgress) {
      debugPrint(
        'BID HISTORY: solicitud omitida. '
        'Disposed: $_disposed, '
        'Auction ID vacío: ${auctionId.isEmpty}, '
        'En progreso: $_historyRequestInProgress',
      );
      return;
    }

    _historyRequestInProgress = true;

    if (!_hasLoadedHistory) {
      _historyLoading = true;
      _notify();
    }

    debugPrint('========== BID HISTORY REQUEST ==========');
    debugPrint('Auction ID: $auctionId');
    debugPrint('Usuario: $currentUserId');

    try {
      final result = await _repository.getAuctionBids(auctionId);

      if (_disposed) return;

      debugPrint('Respuesta recibida correctamente.');
      debugPrint('Cantidad de pujas: ${result.length}');

      _mergeBids(result);

      _historyError = null;
      _hasLoadedHistory = true;

      debugPrint('Pujas integradas correctamente.');
      debugPrint('Total en pantalla: ${_bids.length}');
    } catch (exception, stackTrace) {
      if (_disposed) return;

      debugPrint('========== BID HISTORY ERROR ==========');
      debugPrint('Tipo: ${exception.runtimeType}');
      debugPrint('Error: $exception');
      debugPrint('StackTrace: $stackTrace');
      debugPrint('=======================================');

      _historyError =
          'No fue posible actualizar el historial de pujas.';
    } finally {
      _historyRequestInProgress = false;

      if (!_disposed) {
        _historyLoading = false;
        _notify();
      }

      debugPrint('========== BID HISTORY FINISHED ==========');
    }
  }

  // ============================================================
  // ENVIAR PUJA
  // ============================================================

  Future<void> submitBid() async {
    if (_disposed || !canSubmitBid) {
      debugPrint('BID SUBMIT: envío omitido.');
      return;
    }

    if (currentUserId == null) {
      _bidMessage = 'Debes iniciar sesión para pujar.';
      _notify();
      return;
    }

    _isSubmittingBid = true;
    _bidMessage = 'Enviando solicitud de puja...';
    _bidRequestStatus = null;
    _bidRequestId = null;
    _notify();

    try {
      final idempotencyKey = _generateUuidV4();

      debugPrint('========== BID SUBMIT ==========');
      debugPrint('Auction ID: $auctionId');
      debugPrint('Idempotency key: $idempotencyKey');

      final response = await _repository.createBidRequest(
        auctionId,
        idempotencyKey,
      );

      if (_disposed) return;

      debugPrint('Respuesta POST recibida: $response');

      final requestId = response['id']?.toString();

      if (requestId == null || requestId.isEmpty) {
        throw const FormatException(
          'El backend no devolvió el ID de la solicitud.',
        );
      }

      _bidRequestId = requestId;
      _bidRequestStatus = response['status']?.toString() ?? 'queued';

      debugPrint('Bid request ID: $_bidRequestId');
      debugPrint('Estado inicial: $_bidRequestStatus');

      _updateBidMessage();
      _notify();

      if (isBidPending) {
        await _pollBidRequestStatus();
      } else {
        await _handleTerminalBidStatus();
      }
    } catch (exception, stackTrace) {
      if (_disposed) return;

      debugPrint('========== BID SUBMIT ERROR ==========');
      debugPrint('Tipo: ${exception.runtimeType}');
      debugPrint('Error: $exception');
      debugPrint('StackTrace: $stackTrace');
      debugPrint('======================================');

      _bidMessage =
          'No fue posible enviar la solicitud de puja.';
    } finally {
      if (!_disposed) {
        _isSubmittingBid = false;
        _notify();
      }
    }
  }

  // ============================================================
  // CONSULTAR ESTADO DE SOLICITUD
  // ============================================================

  Future<void> checkBidRequestStatus() async {
    if (_disposed || _bidRequestId == null || _isSubmittingBid) {
      return;
    }

    _isSubmittingBid = true;
    _notify();

    try {
      await _pollBidRequestStatus();
    } finally {
      if (!_disposed) {
        _isSubmittingBid = false;
        _notify();
      }
    }
  }

  Future<void> _pollBidRequestStatus() async {
    if (_bidRequestId == null || _statusRequestInProgress) {
      return;
    }

    _statusRequestInProgress = true;

    try {
      for (var attempt = 0;
          attempt < _maxPollingAttempts;
          attempt++) {
        if (_disposed || !isBidPending) break;

        await Future.delayed(_pollingInterval);

        if (_disposed) break;

        final response = await _repository.getBidRequestStatus(
          _bidRequestId!,
        );

        if (_disposed) break;

        _bidRequestStatus = response['status']?.toString();

        debugPrint(
          'BID REQUEST STATUS: $_bidRequestStatus '
          '(intento ${attempt + 1})',
        );

        _updateBidMessage();
        _notify();

        if (!isBidPending) {
          await _handleTerminalBidStatus();
          break;
        }
      }

      if (!_disposed && isBidPending) {
        _bidMessage =
            'La solicitud sigue procesándose. Puedes consultar su estado nuevamente.';
        _notify();
      }
    } catch (exception, stackTrace) {
      if (_disposed) return;

      debugPrint('========== BID STATUS ERROR ==========');
      debugPrint('Error: $exception');
      debugPrint('StackTrace: $stackTrace');
      debugPrint('======================================');

      _bidMessage =
          'No se pudo consultar el estado de la puja. Intenta actualizarlo.';
      _notify();
    } finally {
      _statusRequestInProgress = false;
    }
  }

  // ============================================================
  // RESULTADO DE LA PUJA
  // ============================================================

  void _updateBidMessage() {
    switch (_bidRequestStatus) {
      case 'queued':
        _bidMessage = 'Tu solicitud está en la fila de procesamiento.';
        break;

      case 'processing':
        _bidMessage = 'Tu puja se está procesando...';
        break;

      case 'accepted':
        _bidMessage = '¡Tu puja fue aceptada!';
        break;

      case 'rejected':
        _bidMessage = 'Tu puja fue rechazada.';
        break;

      case 'expired':
        _bidMessage = 'La solicitud de puja expiró.';
        break;

      default:
        _bidMessage = 'Estado de solicitud desconocido.';
    }
  }

  Future<void> _handleTerminalBidStatus() async {
    if (_disposed) return;

    _updateBidMessage();

    if (bidAccepted) {
      debugPrint('¡PUJA ACEPTADA!');

      // Realtime también actualizará el historial.
      // Esta consulta sirve como respaldo.
      await refreshHistory();
    }

    _notify();
  }

  // ============================================================
  // UUID V4 PARA IDEMPOTENCIA
  // ============================================================

  String _generateUuidV4() {
    final random = Random.secure();

    final bytes = List<int>.generate(
      16,
      (_) => random.nextInt(256),
    );

    // Versión 4.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;

    // Variante RFC 4122.
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    final hex = bytes
        .map((byte) => byte.toRadixString(16).padLeft(2, '0'))
        .join();

    return '${hex.substring(0, 8)}-'
        '${hex.substring(8, 12)}-'
        '${hex.substring(12, 16)}-'
        '${hex.substring(16, 20)}-'
        '${hex.substring(20, 32)}';
  }

  // ============================================================
  // SUPABASE REALTIME
  // ============================================================

  Future<void> _subscribeToBids() async {
    if (_disposed || auctionId.isEmpty) return;

    _realtimeStatus = AuctionRealtimeStatus.connecting;
    _notify();

    try {
      debugPrint('========== BID REALTIME ==========');
      debugPrint('Suscribiendo a subasta: $auctionId');

      final channel = _supabase.channel(
        'auction-bids-$auctionId',
      );

      _channel = channel;

      channel
          .onPostgresChanges(
            event: PostgresChangeEvent.insert,
            schema: 'public',
            table: 'bids',
            filter: PostgresChangeFilter(
              type: PostgresChangeFilterType.eq,
              column: 'auction_id',
              value: auctionId,
            ),
            callback: (payload) {
              if (_disposed) return;

              try {
                debugPrint(
                  'Nueva puja recibida por Realtime.',
                );

                final newBid = AuctionBidModel.fromJson(
                  payload.newRecord,
                );

                if (newBid.auctionId != auctionId) {
                  debugPrint(
                    'Puja ignorada: no corresponde a esta subasta.',
                  );
                  return;
                }

                _mergeBids([newBid]);

                _lastRealtimeBidId = newBid.id;
                _historyError = null;

                debugPrint(
                  'Puja integrada. Secuencia: ${newBid.sequenceNo}',
                );

                _notify();
              } catch (exception, stackTrace) {
                debugPrint(
                  '========== REALTIME BID ERROR ==========',
                );
                debugPrint('Tipo: ${exception.runtimeType}');
                debugPrint('Error: $exception');
                debugPrint('StackTrace: $stackTrace');
                debugPrint(
                  '========================================',
                );

                _historyError =
                    'Se recibió una actualización de puja inválida.';
                _notify();
              }
            },
          )
          .subscribe((status, [error]) {
            if (_disposed) return;

            debugPrint('Realtime status: $status');

            if (error != null) {
              debugPrint('Realtime error: $error');
            }

            switch (status) {
              case RealtimeSubscribeStatus.subscribed:
                _realtimeStatus =
                    AuctionRealtimeStatus.connected;

                refreshHistory();
                break;

              case RealtimeSubscribeStatus.channelError:
              case RealtimeSubscribeStatus.timedOut:
                _realtimeStatus =
                    AuctionRealtimeStatus.reconnecting;
                break;

              case RealtimeSubscribeStatus.closed:
                _realtimeStatus =
                    AuctionRealtimeStatus.disconnected;
                break;
            }

            _notify();
          });
    } catch (exception, stackTrace) {
      debugPrint('========== REALTIME CONNECTION ERROR ==========');
      debugPrint('Tipo: ${exception.runtimeType}');
      debugPrint('Error: $exception');
      debugPrint('StackTrace: $stackTrace');
      debugPrint('================================================');

      if (_disposed) return;

      _realtimeStatus = AuctionRealtimeStatus.disconnected;
      _notify();
    }
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  void _mergeBids(List<AuctionBidModel> incoming) {
    final bidsById = <String, AuctionBidModel>{
      for (final bid in _bids) bid.id: bid,
    };

    for (final bid in incoming) {
      bidsById[bid.id] = bid;
    }

    _bids
      ..clear()
      ..addAll(bidsById.values)
      ..sort(
        (a, b) => b.sequenceNo.compareTo(a.sequenceNo),
      );
  }

  void _notify() {
    if (!_disposed) {
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _disposed = true;

    final channel = _channel;

    if (channel != null) {
      _supabase.removeChannel(channel);
    }

    super.dispose();
  }
}
