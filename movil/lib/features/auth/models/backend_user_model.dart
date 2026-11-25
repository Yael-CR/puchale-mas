
class BackendUserModel {
  final String id;
  final String email;

  const BackendUserModel({
    required this.id,
    required this.email,
  });

  factory BackendUserModel.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final email = json['email'];

    if (id is! String || email is! String) {
      throw const FormatException(
        'Los datos del usuario recibidos desde FastAPI no son válidos.',
      );
    }

    return BackendUserModel(
      id: id,
      email: email,
    );
  }
}
