
import 'package:dio/dio.dart';
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

          if (accessToken != null && accessToken.isNotEmpty) {
            options.headers['Authorization'] =
                'Bearer $accessToken';
          } else {
            options.headers.remove('Authorization');
          }

          handler.next(options);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
