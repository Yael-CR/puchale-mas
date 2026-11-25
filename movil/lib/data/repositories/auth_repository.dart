
import 'package:supabase_flutter/supabase_flutter.dart';

import '../services/auth_service.dart';

class AuthRepository {
  final AuthService _authService;

  AuthRepository(this._authService);

  Session? get currentSession => _authService.currentSession;

  Stream<AuthState> get authStateChanges =>
      _authService.onAuthStateChange;

  Future<bool> signInWithGoogle() {
    return _authService.signInWithGoogle();
  }

  Future<void> signOut() {
    return _authService.signOut();
  }
}
