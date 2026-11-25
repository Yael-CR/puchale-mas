
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  final SupabaseClient _client;

  AuthService(this._client);

  static const String redirectUrl =
      'com.puchale.puchaleplus://login-callback/';

  Session? get currentSession => _client.auth.currentSession;

  Stream<AuthState> get onAuthStateChange =>
      _client.auth.onAuthStateChange;

  Future<bool> signInWithGoogle() {
    return _client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: redirectUrl,
    );
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }
}
