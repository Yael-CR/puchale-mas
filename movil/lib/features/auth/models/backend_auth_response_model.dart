
import 'backend_user_model.dart';

class BackendAuthResponseModel {
  final bool authenticated;
  final BackendUserModel user;

  const BackendAuthResponseModel({
    required this.authenticated,
    required this.user,
  });

  factory BackendAuthResponseModel.fromJson(
    Map<String, dynamic> json,
  ) {
    final authenticated = json['authenticated'];
    final userData = json['user'];

    if (authenticated is! bool || userData is! Map) {
      throw const FormatException(
        'La respuesta de autenticación de FastAPI no es válida.',
      );
    }

    return BackendAuthResponseModel(
      authenticated: authenticated,
      user: BackendUserModel.fromJson(
        Map<String, dynamic>.from(userData),
      ),
    );
  }
}
