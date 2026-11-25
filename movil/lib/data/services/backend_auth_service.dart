
import '../../core/network/api_client.dart';
import '../../features/auth/models/backend_auth_response_model.dart';

class BackendAuthService {
  final ApiClient _apiClient;

  BackendAuthService(this._apiClient);

  Future<BackendAuthResponseModel> getCurrentUser() async {
    final response = await _apiClient.dio.get<Object?>(
      '/api/auth/me',
    );

    final data = response.data;

    if (data is Map) {
      return BackendAuthResponseModel.fromJson(
        Map<String, dynamic>.from(data),
      );
    }

    throw const FormatException(
      'La respuesta de FastAPI no tiene el formato esperado.',
    );
  }
}
