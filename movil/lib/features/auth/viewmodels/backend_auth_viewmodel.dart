
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../data/repositories/backend_auth_repository.dart';

class BackendAuthViewModel extends ChangeNotifier {
  final BackendAuthRepository _repository;

  BackendAuthViewModel(this._repository);

  bool _isLoading = false;
  Map<String, dynamic>? _userData;
  String? _error;
  int? _statusCode;

  bool get isLoading => _isLoading;
  Map<String, dynamic>? get userData => _userData;
  String? get error => _error;
  int? get statusCode => _statusCode;

  Future<void> verifyConnection() async {
    if (_isLoading) return;

    _isLoading = true;
    _error = null;
    _userData = null;
    _statusCode = null;
    notifyListeners();

    try {
      _userData = await _repository.getCurrentUser();
      _statusCode = 200;
    } on DioException catch (exception) {
      _statusCode = exception.response?.statusCode;

      final responseData = exception.response?.data;

      if (responseData is Map) {
        _error = responseData['detail']?.toString() ??
            responseData['message']?.toString() ??
            'El servidor rechazó la solicitud.';
      } else {
        _error = exception.message ??
            'No fue posible conectar con el servidor.';
      }
    } catch (exception) {
      _error = 'Error inesperado: $exception';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearResult() {
    _userData = null;
    _error = null;
    _statusCode = null;
    notifyListeners();
  }
}
