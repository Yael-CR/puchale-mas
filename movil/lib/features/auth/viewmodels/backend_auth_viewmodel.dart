
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../data/repositories/backend_auth_repository.dart';
import '../models/backend_auth_response_model.dart';

class BackendAuthViewModel extends ChangeNotifier {
  final BackendAuthRepository _repository;

  BackendAuthViewModel(this._repository);

  bool _isLoading = false;
  BackendAuthResponseModel? _authResponse;
  String? _error;
  int? _statusCode;

  int _requestVersion = 0;

  bool get isLoading => _isLoading;
  BackendAuthResponseModel? get authResponse => _authResponse;
  String? get error => _error;
  int? get statusCode => _statusCode;

  /// Sincroniza el estado del backend con la sesión de Supabase.
  Future<void> syncWithSession(bool authenticated) async {
    if (!authenticated) {
      clearResult();
      return;
    }

    await verifyConnection();
  }

  /// Consulta el usuario autenticado en FastAPI.
  Future<void> verifyConnection() async {
    if (_isLoading) return;

    final requestVersion = ++_requestVersion;

    _isLoading = true;
    _error = null;
    _authResponse = null;
    _statusCode = null;

    notifyListeners();

    try {
      final response = await _repository.getCurrentUser();

      if (requestVersion != _requestVersion) return;

      _authResponse = response;
      _statusCode = 200;
    } on DioException catch (exception) {
      if (requestVersion != _requestVersion) return;

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
      if (requestVersion != _requestVersion) return;

      _error = 'Error inesperado: $exception';
    } finally {
      if (requestVersion == _requestVersion) {
        _isLoading = false;
        notifyListeners();
      }
    }
  }

  /// Limpia los datos al cerrar sesión.
  void clearResult() {
    _requestVersion++;
    _isLoading = false;
    _authResponse = null;
    _error = null;
    _statusCode = null;

    notifyListeners();
  }
}
