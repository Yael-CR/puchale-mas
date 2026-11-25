
class AppConfig {
  static const String supabaseUrl =
      String.fromEnvironment('SUPABASE_URL');

  static const String supabasePublishableKey =
      String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY');

  static const String apiBaseUrl =
      String.fromEnvironment('API_BASE_URL');

  static void validate() {
    if (supabaseUrl.isEmpty ||
        supabasePublishableKey.isEmpty ||
        apiBaseUrl.isEmpty) {
      throw Exception(
        'Faltan variables de configuración de la aplicación.',
      );
    }

    final apiUri = Uri.tryParse(apiBaseUrl);

    if (apiUri == null ||
        !apiUri.hasScheme ||
        apiUri.host.isEmpty) {
      throw Exception('La dirección del backend no es válida.');
    }
  }
}
