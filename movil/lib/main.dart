
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app.dart';
import 'core/config/app_config.dart';
import 'core/network/api_client.dart';

import 'data/repositories/auth_repository.dart';
import 'data/repositories/backend_auth_repository.dart';
import 'data/repositories/auction_repository.dart';

import 'data/services/auth_service.dart';
import 'data/services/backend_auth_service.dart';
import 'data/services/auction_service.dart';

import 'features/auth/viewmodels/auth_viewmodel.dart';
import 'features/auth/viewmodels/backend_auth_viewmodel.dart';
import 'features/home/viewmodels/home_viewmodel.dart';
import 'features/auctions/viewmodels/auctions_viewmodel.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  AppConfig.validate();

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    publishableKey: AppConfig.supabasePublishableKey,
  );

  final supabaseClient = Supabase.instance.client;

  // Autenticación Supabase.
  final authService = AuthService(supabaseClient);
  final authRepository = AuthRepository(authService);

  // Cliente HTTP autenticado para FastAPI.
  final apiClient = ApiClient(
    baseUrl: AppConfig.apiBaseUrl,
    supabaseClient: supabaseClient,
  );

  // Subastas.
  final auctionService = AuctionService(apiClient);
  final auctionRepository = AuctionRepository(auctionService);

  // Autenticación del backend.
  final backendAuthService = BackendAuthService(apiClient);
  final backendAuthRepository = BackendAuthRepository(
    backendAuthService,
  );

  runApp(
    MultiProvider(
      providers: [
        // Supabase.
        Provider<SupabaseClient>.value(
          value: supabaseClient,
        ),

        // Servicios y repositorios de autenticación.
        Provider<AuthService>.value(
          value: authService,
        ),
        Provider<AuthRepository>.value(
          value: authRepository,
        ),

        // Cliente HTTP.
        Provider<ApiClient>.value(
          value: apiClient,
        ),

        // Backend.
        Provider<BackendAuthService>.value(
          value: backendAuthService,
        ),
        Provider<BackendAuthRepository>.value(
          value: backendAuthRepository,
        ),

        // Subastas.
        Provider<AuctionService>.value(
          value: auctionService,
        ),
        Provider<AuctionRepository>.value(
          value: auctionRepository,
        ),

        // ViewModel de autenticación.
        ChangeNotifierProvider<AuthViewModel>(
          create: (_) => AuthViewModel(authRepository),
        ),

        // ViewModel de autenticación del backend.
        ChangeNotifierProxyProvider<
            AuthViewModel,
            BackendAuthViewModel>(
          create: (_) => BackendAuthViewModel(
            backendAuthRepository,
          ),
          update: (_, authViewModel, backendAuthViewModel) {
            final backendViewModel = backendAuthViewModel!;

            backendViewModel.syncWithSession(
              authViewModel.isAuthenticated,
            );

            return backendViewModel;
          },
        ),

        // ViewModel de inicio.
        ChangeNotifierProvider<HomeViewModel>(
          create: (_) => HomeViewModel(),
        ),

        // ViewModel de subastas.
        ChangeNotifierProvider<AuctionsViewModel>(
          create: (_) => AuctionsViewModel(
            auctionRepository,
          ),
        ),
      ],
      child: const PuchaleApp(),
    ),
  );
}
