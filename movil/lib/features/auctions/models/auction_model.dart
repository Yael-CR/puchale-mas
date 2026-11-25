import 'auction_product_model.dart';

class AuctionModel {
  final String id;
  final String productId;
  final String sellerId;

  final String type;
  final String status;

  final double startingPrice;
  final double incrementAmount;
  final double maxBidAmount;
  final String currency;
  final double currentPrice;

  final AuctionProductModel product;

  const AuctionModel({
    required this.id,
    required this.productId,
    required this.sellerId,
    required this.type,
    required this.status,
    required this.startingPrice,
    required this.incrementAmount,
    required this.maxBidAmount,
    required this.currency,
    required this.currentPrice,
    required this.product,
  });

  factory AuctionModel.fromJson(Map<String, dynamic> json) {
    final productData = json['product'];

    if (productData is! Map) {
      throw const FormatException(
        'La subasta no contiene información válida del producto.',
      );
    }

    return AuctionModel(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      sellerId: json['seller_id'] as String,
      type: json['type'] as String,
      status: json['status'] as String,
      startingPrice: (json['starting_price'] as num).toDouble(),
      incrementAmount: (json['increment_amount'] as num).toDouble(),
      maxBidAmount: (json['max_bid_amount'] as num).toDouble(),
      currency: json['currency'] as String,
      currentPrice: (json['current_price'] as num).toDouble(),
      product: AuctionProductModel.fromJson(
        Map<String, dynamic>.from(productData),
      ),
    );
  }
}