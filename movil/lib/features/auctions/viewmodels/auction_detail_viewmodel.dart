
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../data/repositories/auction_repository.dart';
import '../models/auction_model.dart';

class AuctionDetailViewModel extends ChangeNotifier {
  final AuctionRepository _repository;
  final String auctionId;

  AuctionDetailViewModel(
    this._repository,
    this.auctionId,
  );

  AuctionModel? _auction;
  String? _error;

  bool _isLoading = false;
  bool _hasLoaded = false;
  bool _disposed = false;

  AuctionModel? get auction => _auction;

  String? get error => _error;

  bool get isLoading => _isLoading;

  bool get hasLoaded => _hasLoaded;

  Future<void> loadAuction() async {
    if (_isLoading || _hasLoaded) return;

    _isLoading = true;
    _error = null;

    notifyListeners();

    try {
      final result = await _repository.getAuctionById(
        auctionId,
      );

      if (_disposed) return;

      _auction = result;
    } on DioException catch (exception) {
      if (_disposed) return;

      final responseData = exception.response?.data;

      if (responseData is Map) {
        _error = responseData['detail']?.toString() ??
            responseData['message']?.toString() ??
            'No fue posible cargar la subasta.';
      } else {
        _error = exception.message ??
            'No fue posible conectar con el servidor.';
      }
    } catch (exception) {
      if (_disposed) return;

      _error = exception is FormatException
          ? exception.message
          : 'Ocurrió un error inesperado al cargar la subasta.';
    } finally {
      if (!_disposed) {
        _isLoading = false;
        _hasLoaded = true;
        notifyListeners();
      }
    }
  }

  Future<void> retry() async {
    _hasLoaded = false;
    _auction = null;
    _error = null;

    await loadAuction();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
