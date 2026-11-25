class ProductImageModel {
  final String id;
  final String storagePath;
  final int position;
  final String? url;

  const ProductImageModel({
    required this.id,
    required this.storagePath,
    required this.position,
    this.url,
  });

  factory ProductImageModel.fromJson(Map<String, dynamic> json) {
    return ProductImageModel(
      id: json['id'] as String,
      storagePath: json['storage_path'] as String,
      position: (json['position'] as num).toInt(),
      url: json['url'] as String?,
    );
  }
}