import 'product_image_model.dart';

class AuctionProductModel {
  final String id;
  final String title;
  final String? description;
  final String? condition;
  final String status;
  final List<ProductImageModel> images;

  const AuctionProductModel({
    required this.id,
    required this.title,
    this.description,
    this.condition,
    required this.status,
    required this.images,
  });

  factory AuctionProductModel.fromJson(Map<String, dynamic> json) {
    final imagesData = json['images'] as List? ?? [];

    return AuctionProductModel(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      condition: json['condition'] as String?,
      status: json['status'] as String,
      images: imagesData.map((image) {
        return ProductImageModel.fromJson(
          Map<String, dynamic>.from(image as Map),
        );
      }).toList(),
    );
  }
}