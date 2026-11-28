
import '../../core/network/api_client.dart';

class AuctionService {
  final ApiClient _apiClient;

  AuctionService(this._apiClient);

  Future<List<Map<String, dynamic>>> getAuctions() async {
    final response = await _apiClient.dio.get(
      '/api/auction-catalog',
    );

    final data = response.data;

    if (data is! List) {
      throw const FormatException(
        'La respuesta del catálogo de subastas no es válida.',
      );
    }

    return data.map((item) {
      if (item is! Map) {
        throw const FormatException(
          'Se recibió una subasta con formato inválido.',
        );
      }

      return Map<String, dynamic>.from(item);
    }).toList();
  }

  Future<Map<String, dynamic>> getAuctionById(
    String auctionId,
  ) async {
    final response = await _apiClient.dio.get(
      '/api/auction-catalog/$auctionId',
    );

    final data = response.data;

    if (data is! Map) {
      throw const FormatException(
        'La respuesta del detalle de la subasta no es válida.',
      );
    }

    return Map<String, dynamic>.from(data);
  }
}
