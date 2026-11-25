
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_theme.dart';
import '../viewmodels/backend_auth_viewmodel.dart';

class BackendConnectionCard extends StatelessWidget {
  const BackendConnectionCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<BackendAuthViewModel>(
      builder: (context, viewModel, child) {
        final authResponse = viewModel.authResponse;

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: const Color(0xFF101010),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.08),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.cloud_outlined,
                    color: AppTheme.brand,
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Conexión con Puchale API',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 8),

              Text(
                'Verifica la comunicación entre la aplicación y el servidor.',
                style: TextStyle(
                  color: Colors.grey.shade400,
                  fontSize: 12,
                ),
              ),

              const SizedBox(height: 16),

              SizedBox(
                height: 46,
                child: ElevatedButton.icon(
                  onPressed: viewModel.isLoading
                      ? null
                      : viewModel.verifyConnection,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.brand,
                    foregroundColor: Colors.black,
                    disabledBackgroundColor:
                        AppTheme.brand.withValues(alpha: 0.4),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  icon: viewModel.isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.black,
                          ),
                        )
                      : const Icon(Icons.sync_rounded),
                  label: Text(
                    viewModel.isLoading
                        ? 'Verificando...'
                        : 'Verificar conexión',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),

              if (viewModel.statusCode != null) ...[
                const SizedBox(height: 14),
                Text(
                  'Código HTTP: ${viewModel.statusCode}',
                  style: const TextStyle(
                    color: AppTheme.brand,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ],

              if (authResponse != null) ...[
                const SizedBox(height: 12),
                const Row(
                  children: [
                    Icon(
                      Icons.check_circle,
                      color: AppTheme.brand,
                      size: 18,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Respuesta recibida correctamente',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                _ResponseRow(
                  label: 'Autenticado',
                  value: authResponse.authenticated ? 'Sí' : 'No',
                ),

                const SizedBox(height: 8),

                _ResponseRow(
                  label: 'ID de usuario',
                  value: authResponse.user.id,
                ),

                const SizedBox(height: 8),

                _ResponseRow(
                  label: 'Correo electrónico',
                  value: authResponse.user.email,
                ),
              ],

              if (viewModel.error != null) ...[
                const SizedBox(height: 12),
                Text(
                  viewModel.error!,
                  style: const TextStyle(
                    color: Colors.redAccent,
                    fontSize: 12,
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _ResponseRow extends StatelessWidget {
  final String label;
  final String value;

  const _ResponseRow({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: 4),
          SelectableText(
            value,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }
}
