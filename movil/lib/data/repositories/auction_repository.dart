
import '../../features/auctions/models/auction_model.dart';
import '../services/auction_service.dart';
import '../../features/auctions/models/auction_bid_model.dart';


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

}
