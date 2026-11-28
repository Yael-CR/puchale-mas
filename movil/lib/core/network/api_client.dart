
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart'
    hide Headers;

class ApiClient {
  final Dio _dio;

  ApiClient({
    required String baseUrl,
    required SupabaseClient supabaseClient,
  }) : _dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            sendTimeout: const Duration(seconds: 15),
            headers: {
              Headers.acceptHeader: Headers.jsonContentType,
              Headers.contentTypeHeader: Headers.jsonContentType,
            },
          ),
        ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          final session = supabaseClient.auth.currentSession;
          final accessToken = session?.accessToken;

          debugPrint('========== API AUTH DEBUG ==========');
          debugPrint(
            'Endpoint: ${options.method} ${options.path}',
          );
          debugPrint('Sesión disponible: ${session != null}');
          debugPrint(
            'Usuario autenticado: ${supabaseClient.auth.currentUser?.id}',
          );
          debugPrint(
            'Token disponible: ${accessToken != null && accessToken.isNotEmpty}',
          );

          if (session?.expiresAt != null) {
            final expiration =
                DateTime.fromMillisecondsSinceEpoch(
              session!.expiresAt! * 1000,
            );

            debugPrint('Expiración del token: $expiration');
            debugPrint(
              'Token expirado: ${expiration.isBefore(DateTime.now())}',
            );
          }

          if (accessToken != null && accessToken.isNotEmpty) {
            options.headers['Authorization'] =
                'Bearer $accessToken';
          } else {
            options.headers.remove('Authorization');
          }

          debugPrint(
            'Authorization enviado: '
            '${options.headers.containsKey('Authorization')}',
          );
          debugPrint('====================================');

          handler.next(options);
        },
        onError: (error, handler) {
          debugPrint('========== API ERROR DEBUG ==========');
          debugPrint(
            'Endpoint: ${error.requestOptions.method} '
            '${error.requestOptions.path}',
          );
          debugPrint('Tipo de error: ${error.type}');
          debugPrint('Mensaje: ${error.message}');
          debugPrint('Código HTTP: ${error.response?.statusCode}');
          debugPrint(
            'Respuesta backend: ${error.response?.data}',
          );
          debugPrint('====================================');

          handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
