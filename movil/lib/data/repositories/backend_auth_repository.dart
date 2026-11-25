
import '../services/backend_auth_service.dart';

class BackendAuthRepository {
  final BackendAuthService _backendAuthService;

  BackendAuthRepository(this._backendAuthService);

  Future<Map<String, dynamic>> getCurrentUser() {
    return _backendAuthService.getCurrentUser();
  }
}
