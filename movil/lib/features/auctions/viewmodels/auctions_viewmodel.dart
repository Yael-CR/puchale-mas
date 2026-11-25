import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../data/repositories/auction_repository.dart';
import '../models/auction_model.dart';

class AuctionsViewModel extends ChangeNotifier {
  final AuctionRepository _repository;

  AuctionsViewModel(this._repository);

  List<AuctionModel> _auctions = [];

  bool _isLoading = false;
  bool _isRefreshing = false;
  bool _hasLoaded = false;
  bool _disposed = false;

  String? _error;

  // Getters

  List<AuctionModel> get auctions => List.unmodifiable(_auctions);

  bool get isLoading => _isLoading;

  bool get isRefreshing => _isRefreshing;

  bool get hasLoaded => _hasLoaded;

  String? get error => _error;

  bool get hasAuctions => _auctions.isNotEmpty;

  bool get isEmpty => _hasLoaded && _auctions.isEmpty && _error == null;

  // Cargar subastas

  Future<void> loadAuctions() async {
    if (_isLoading) return;

    _isLoading = true;
    _error = null;

    notifyListeners();

    try {
      final result = await _repository.getAuctions();

      if (_disposed) return;

      _auctions = result;
      _hasLoaded = true;
    } on DioException catch (exception) {
      if (_disposed) return;

      final responseData = exception.response?.data;

      if (responseData is Map) {
        _error = responseData['detail']?.toString() ??
            responseData['message']?.toString() ??
            'No fue posible cargar las subastas.';
      } else {
        _error = exception.message ??
            'No fue posible conectar con el servidor.';
      }
    } catch (exception) {
      if (_disposed) return;

      _error = exception is FormatException
          ? exception.message
          : 'Ocurrió un error inesperado al cargar las subastas.';
    } finally {
      if (!_disposed) {
        _isLoading = false;
        _hasLoaded = true;
        notifyListeners();
      }
    }
  }

  // Actualizar listado

  Future<void> refresh() async {
    if (_isLoading) return;

    _isRefreshing = true;
    _error = null;

    notifyListeners();

    try {
      final result = await _repository.getAuctions();

      if (_disposed) return;

      _auctions = result;
    } on DioException catch (exception) {
      if (_disposed) return;

      final responseData = exception.response?.data;

      if (responseData is Map) {
        _error = responseData['detail']?.toString() ??
            responseData['message']?.toString() ??
            'No fue posible actualizar las subastas.';
      } else {
        _error = exception.message ??
            'No fue posible conectar con el servidor.';
      }
    } catch (exception) {
      if (_disposed) return;

      _error = exception is FormatException
          ? exception.message
          : 'Ocurrió un error inesperado al actualizar las subastas.';
    } finally {
      if (!_disposed) {
        _isRefreshing = false;
        _hasLoaded = true;
        notifyListeners();
      }
    }
  }

  // Limpiar error

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}