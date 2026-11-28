
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

  final List<AuctionBidModel> _bids = [];

  List<AuctionBidModel> get bids =>
      List.unmodifiable(_bids);

  bool _historyLoading = false;
  bool get historyLoading => _historyLoading;

  String? _historyError;
  String? get historyError => _historyError;

  AuctionRealtimeStatus _realtimeStatus =
      AuctionRealtimeStatus.connecting;

  AuctionRealtimeStatus get realtimeStatus =>
      _realtimeStatus;

  String? _lastRealtimeBidId;
  String? get lastRealtimeBidId => _lastRealtimeBidId;

  bool _hasLoadedHistory = false;
  bool _historyRequestInProgress = false;
  bool _disposed = false;

  RealtimeChannel? _channel;

  String? get currentUserId =>
      _supabase.auth.currentUser?.id;

  bool isOwnBid(AuctionBidModel bid) {
    return currentUserId != null &&
        bid.bidderId == currentUserId;
  }

  Future<void> initialize() async {
    await _subscribeToBids();
    await refreshHistory();
  }

  Future<void> refreshHistory() async {
    if (_disposed ||
        auctionId.isEmpty ||
        _historyRequestInProgress) {
      return;
    }

    _historyRequestInProgress = true;

    if (!_hasLoadedHistory) {
      _historyLoading = true;
      _notify();
    }

    try {
      final result = await _repository.getAuctionBids(
        auctionId,
      );

      if (_disposed) return;

      _mergeBids(result);

      _historyError = null;
      _hasLoadedHistory = true;
    } catch (exception) {
      if (_disposed) return;

      _historyError =
          'No fue posible actualizar el historial de pujas.';
    } finally {
      _historyRequestInProgress = false;

      if (!_disposed) {
        _historyLoading = false;
        _notify();
      }
    }
  }

  Future<void> _subscribeToBids() async {
    if (_disposed || auctionId.isEmpty) return;

    _realtimeStatus = AuctionRealtimeStatus.connecting;
    _notify();

    try {
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
                final newBid = AuctionBidModel.fromJson(
                  payload.newRecord,
                );

                if (newBid.auctionId != auctionId) {
                  return;
                }

                _mergeBids([newBid]);

                _lastRealtimeBidId = newBid.id;
                _historyError = null;

                _notify();
              } catch (_) {
                _historyError =
                    'Se recibió una actualización de puja inválida.';
                _notify();
              }
            },
          )
          .subscribe((status, [error]) {
            if (_disposed) return;

            switch (status) {
              case RealtimeSubscribeStatus.subscribed:
                _realtimeStatus =
                    AuctionRealtimeStatus.connected;

                // Sincronizar al recuperar la conexión.
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
    } catch (_) {
      if (_disposed) return;

      _realtimeStatus =
          AuctionRealtimeStatus.disconnected;

      _notify();
    }
  }

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
