
import '../../features/auctions/models/auction_model.dart';
import '../../features/auctions/models/auction_bid_model.dart';
import '../services/auction_service.dart';

class AuctionRepository {
  final AuctionService _auctionService;

  AuctionRepository(this._auctionService);

  Future<List<AuctionModel>> getAuctions() async {
    final response = await _auctionService.getAuctions();

    return response.map((json) {
      return AuctionModel.fromJson(json);
    }).toList();
  }

  Future<AuctionModel> getAuctionById(
    String auctionId,
  ) async {
    final response = await _auctionService.getAuctionById(
      auctionId,
    );

    return AuctionModel.fromJson(response);
  }

  Future<List<AuctionBidModel>> getAuctionBids(
    String auctionId,
  ) async {
    final response = await _auctionService.getAuctionBids(
      auctionId,
    );

    return response.map((json) {
      return AuctionBidModel.fromJson(json);
    }).toList();
  }

  // Crear solicitud de puja.
  Future<Map<String, dynamic>> createBidRequest(
    String auctionId,
    String idempotencyKey,
  ) async {
    return await _auctionService.createBidRequest(
      auctionId,
      idempotencyKey,
    );
  }

  // Consultar estado de una solicitud.
  Future<Map<String, dynamic>> getBidRequestStatus(
    String requestId,
  ) async {
    return await _auctionService.getBidRequestStatus(
      requestId,
    );
  }
}
