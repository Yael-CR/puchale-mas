
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:puchale_plus/app.dart';
import 'package:puchale_plus/core/network/api_client.dart';
import 'package:puchale_plus/data/repositories/auth_repository.dart';
import 'package:puchale_plus/data/repositories/backend_auth_repository.dart';
import 'package:puchale_plus/data/services/auth_service.dart';
import 'package:puchale_plus/data/services/backend_auth_service.dart';
import 'package:puchale_plus/features/auth/viewmodels/auth_viewmodel.dart';
import 'package:puchale_plus/features/auth/viewmodels/backend_auth_viewmodel.dart';
import 'package:puchale_plus/features/home/viewmodels/home_viewmodel.dart';

void main() {
  testWidgets(
    'Puchale+ muestra correctamente la pantalla inicial',
    (WidgetTester tester) async {
      // Cliente local exclusivo para las pruebas.
      final supabaseClient = SupabaseClient(
        'http://localhost:54321',
        'test-publishable-key',
      );

      // Evita mantener activo el temporizador de renovación automática.
      supabaseClient.auth.stopAutoRefresh();

      // Dependencias de autenticación.
      final authService = AuthService(supabaseClient);
      final authRepository = AuthRepository(authService);

      // Dependencias de comunicación con FastAPI.
      final apiClient = ApiClient(
        baseUrl: 'http://localhost:8000',
        supabaseClient: supabaseClient,
      );

      final backendAuthService = BackendAuthService(apiClient);

      final backendAuthRepository = BackendAuthRepository(
        backendAuthService,
      );

      await tester.pumpWidget(
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
            Provider<BackendAuthService>.value(
              value: backendAuthService,
            ),
            Provider<BackendAuthRepository>.value(
              value: backendAuthRepository,
            ),
            ChangeNotifierProvider(
              create: (_) => AuthViewModel(authRepository),
            ),
            ChangeNotifierProvider(
              create: (_) => BackendAuthViewModel(
                backendAuthRepository,
              ),
            ),
            ChangeNotifierProvider(
              create: (_) => HomeViewModel(),
            ),
          ],
          child: const PuchaleApp(),
        ),
      );

      await tester.pumpAndSettle();

      expect(find.text('PUCHALE+'), findsOneWidget);

      expect(
        find.text('Tu próxima oportunidad comienza aquí.'),
        findsOneWidget,
      );

      expect(find.text('Inicio'), findsOneWidget);
      expect(find.text('Subastas'), findsOneWidget);
      expect(find.text('Catálogo'), findsOneWidget);
      expect(find.text('Avisos'), findsOneWidget);
      expect(find.text('Perfil'), findsOneWidget);

      expect(
        find.text('Continuar con Google'),
        findsOneWidget,
      );
    },
  );
}
