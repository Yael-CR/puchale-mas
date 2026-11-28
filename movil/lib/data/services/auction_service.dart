
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

  Future<List<Map<String, dynamic>>> getAuctionBids(
    String auctionId,
  ) async {
    final response = await _apiClient.dio.get(
      '/api/auctions/$auctionId/bids',
    );

    final data = response.data;

    if (data is! List) {
      throw const FormatException(
        'La respuesta del historial de pujas no es válida.',
      );
    }

    return data.map((item) {
      if (item is! Map) {
        throw const FormatException(
          'Se recibió una puja con formato inválido.',
        );
      }

      return Map<String, dynamic>.from(item);
    }).toList();
  }

  // Crear solicitud de puja.
  Future<Map<String, dynamic>> createBidRequest(
    String auctionId,
    String idempotencyKey,
  ) async {
    final response = await _apiClient.dio.post(
      '/api/auctions/$auctionId/bids',
      data: {
        'idempotency_key': idempotencyKey,
      },
    );

    final data = response.data;

    if (data is! Map) {
      throw const FormatException(
        'La respuesta de la solicitud de puja no es válida.',
      );
    }

    return Map<String, dynamic>.from(data);
  }

  // Consultar estado de una solicitud de puja.
  Future<Map<String, dynamic>> getBidRequestStatus(
    String requestId,
  ) async {
    final response = await _apiClient.dio.get(
      '/api/auctions/bid-requests/$requestId',
    );

    final data = response.data;

    if (data is! Map) {
      throw const FormatException(
        'La respuesta del estado de la puja no es válida.',
      );
    }

    return Map<String, dynamic>.from(data);
  }
}
