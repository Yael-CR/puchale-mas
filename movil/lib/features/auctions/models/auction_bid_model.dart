
class AuctionBidModel {
  final String id;
  final String auctionId;
  final String bidderId;
  final double amount;
  final int sequenceNo;
  final DateTime acceptedAt;

  const AuctionBidModel({
    required this.id,
    required this.auctionId,
    required this.bidderId,
    required this.amount,
    required this.sequenceNo,
    required this.acceptedAt,
  });

  factory AuctionBidModel.fromJson(Map<String, dynamic> json) {
    return AuctionBidModel(
      id: json['id'] as String,
      auctionId: json['auction_id'] as String,
      bidderId: json['bidder_id'] as String,
      amount: double.parse(json['amount'].toString()),
      sequenceNo: int.parse(json['sequence_no'].toString()),
      acceptedAt: DateTime.parse(json['accepted_at'] as String),
    );
  }
}
