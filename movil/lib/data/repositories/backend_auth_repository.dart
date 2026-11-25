
import '../../features/auth/models/backend_auth_response_model.dart';
import '../services/backend_auth_service.dart';

class BackendAuthRepository {
  final BackendAuthService _backendAuthService;

  BackendAuthRepository(this._backendAuthService);

  Future<BackendAuthResponseModel> getCurrentUser() {
    return _backendAuthService.getCurrentUser();
  }
}
