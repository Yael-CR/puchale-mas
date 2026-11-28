
import 'package:flutter/material.dart';

class AuctionGallery extends StatefulWidget {
  final List<dynamic> images;

  const AuctionGallery({
    super.key,
    required this.images,
  });

  static const Color _brandColor = Color(0xFFA3FF00);

  @override
  State<AuctionGallery> createState() => _AuctionGalleryState();
}

class _AuctionGalleryState extends State<AuctionGallery> {
  final PageController _controller = PageController();

  int _currentPage = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        SizedBox(
          height: 340,
          child: widget.images.isEmpty
              ? _placeholder(theme)
              : PageView.builder(
                  controller: _controller,
                  itemCount: widget.images.length,
                  onPageChanged: (index) {
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemBuilder: (context, index) {
                    final imageUrl = widget.images[index].url;

                    return imageUrl != null &&
                            imageUrl.toString().isNotEmpty
                        ? Image.network(
                            imageUrl,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) =>
                                _placeholder(theme),
                          )
                        : _placeholder(theme);
                  },
                ),
        ),
        if (widget.images.length > 1) ...[
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              widget.images.length,
              (index) => AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: index == _currentPage ? 22 : 7,
                height: 7,
                decoration: BoxDecoration(
                  color: index == _currentPage
                      ? AuctionGallery._brandColor
                      : theme.colorScheme.onSurface
                          .withValues(alpha: 0.25),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _placeholder(ThemeData theme) {
    return Container(
      width: double.infinity,
      color: theme.colorScheme.surface,
      child: Center(
        child: Icon(
          Icons.inventory_2_outlined,
          size: 90,
          color: theme.colorScheme.onSurface
              .withValues(alpha: 0.35),
        ),
      ),
    );
  }
}
