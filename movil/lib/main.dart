
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/config/app_config.dart';
import 'core/network/api_client.dart';
import 'data/repositories/auth_repository.dart';
import 'data/services/auth_service.dart';
import 'features/auth/viewmodels/auth_viewmodel.dart';
import 'features/home/viewmodels/home_viewmodel.dart';

import 'data/repositories/backend_auth_repository.dart';
import 'data/services/backend_auth_service.dart';
import 'features/auth/viewmodels/backend_auth_viewmodel.dart';


Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  AppConfig.validate();

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    publishableKey: AppConfig.supabasePublishableKey,
  );

  // Cliente de Supabase
  final supabaseClient = Supabase.instance.client;

  // Dependencias de autenticación
  final authService = AuthService(
    supabaseClient,
  );

  final authRepository = AuthRepository(
    authService,
  );

  // Cliente HTTP autenticado para FastAPI
  final apiClient = ApiClient(
    baseUrl: AppConfig.apiBaseUrl,
    supabaseClient: supabaseClient,
  );

  // Comunicación con la autenticación de FastAPI
final backendAuthService = BackendAuthService(
  apiClient,
);

final backendAuthRepository = BackendAuthRepository(
  backendAuthService,
);

  runApp(
    MultiProvider(
      providers: [
        Provider<SupabaseClient>.value(
          value: supabaseClient,
        ),
        Provider<AuthService>.value(
          value: authService,
        ),
        Provider<AuthRepository>.value(
          value: authRepository,
        ),
        Provider<ApiClient>.value(
          value: apiClient,
        ),
        ChangeNotifierProvider(
          create: (_) => AuthViewModel(authRepository),
        ),
        ChangeNotifierProvider(
          create: (_) => HomeViewModel(),
        ),
        Provider<BackendAuthService>.value(
          value: backendAuthService,
        ),
        ChangeNotifierProvider(
          create: (_) => BackendAuthViewModel(
            backendAuthRepository,
          ),
        ),

        Provider<BackendAuthRepository>.value(
          value: backendAuthRepository,
        ),
      ],
      child: const PuchaleApp(),
    ),
  );
}
