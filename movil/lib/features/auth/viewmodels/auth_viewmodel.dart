
import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../data/repositories/auth_repository.dart';

class AuthViewModel extends ChangeNotifier {
  final AuthRepository _authRepository;

  StreamSubscription<AuthState>? _authSubscription;

  Session? _session;
  bool _isLoading = false;
  String? _error;

  AuthViewModel(this._authRepository) {
    _session = _authRepository.currentSession;

    _authSubscription = _authRepository.authStateChanges.listen(
      _handleAuthStateChange,
      onError: (Object error) {
        _error = error.toString();
        notifyListeners();
      },
    );
  }

  // Estado de autenticación

  Session? get session => _session;

  User? get user => _session?.user;

  bool get isAuthenticated => _session != null;

  bool get isLoading => _isLoading;

  String? get error => _error;

  // Cambios de sesión de Supabase

  void _handleAuthStateChange(AuthState state) {
    _session = state.session;
    _isLoading = false;
    _error = null;

    notifyListeners();
  }

  // Inicio de sesión con Google

  Future<void> signInWithGoogle() async {
    _setLoading(true);
    _error = null;

    try {
      final launched = await _authRepository.signInWithGoogle();

      if (!launched) {
        _error = 'No se pudo iniciar el proceso de autenticación.';
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Cerrar sesión

  Future<void> signOut() async {
    _setLoading(true);
    _error = null;

    try {
      await _authRepository.signOut();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Limpiar errores

  void clearError() {
    if (_error == null) return;

    _error = null;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }
}
