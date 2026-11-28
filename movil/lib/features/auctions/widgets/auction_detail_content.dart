
import 'package:flutter/material.dart';

import '../models/auction_model.dart';

class AuctionDetailContent extends StatelessWidget {
  final AuctionModel auction;

  const AuctionDetailContent({
    super.key,
    required this.auction,
  });

  static const Color _brandColor = Color(0xFFA3FF00);

  String _formatMoney(double amount) {
    return '\$${amount.toStringAsFixed(2)} ${auction.currency}';
  }

  String get _statusLabel {
    switch (auction.status) {
      case 'scheduled':
        return 'Programada';
      case 'active':
        return 'En curso';
      case 'closing':
        return 'Cerrando';
      case 'finished':
        return 'Finalizada';
      case 'no_winner':
        return 'Sin ganador';
      default:
        return auction.status;
    }
  }

  Color get _statusColor {
    switch (auction.status) {
      case 'active':
        return _brandColor;
      case 'closing':
        return Colors.orange;
      case 'finished':
        return Colors.blueGrey;
      case 'no_winner':
        return Colors.redAccent;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final images = [...auction.product.images]
      ..sort((a, b) => a.position.compareTo(b.position));

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: _Gallery(images: images),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _Chip(
                    label: auction.type == 'express'
                        ? 'SUBASTA EXPRESS'
                        : 'SUBASTA ESTÁNDAR',
                    color: _brandColor,
                  ),
                  _Chip(
                    label: _statusLabel.toUpperCase(),
                    color: _statusColor,
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Text(
                auction.product.title,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              if (auction.product.condition != null &&
                  auction.product.condition!.isNotEmpty) ...[
                const SizedBox(height: 10),
                Row(
                  children: [
                    Icon(
                      Icons.inventory_2_outlined,
                      size: 18,
                      color: theme.colorScheme.onSurface
                          .withValues(alpha: 0.6),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      auction.product.condition!,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurface
                            .withValues(alpha: 0.65),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 24),
              _PriceCard(
                currentPrice: _formatMoney(auction.currentPrice),
                increment: _formatMoney(auction.incrementAmount),
              ),
              const SizedBox(height: 24),
              Text(
                'Información de la subasta',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 14),
              _InfoRow(
                icon: Icons.price_change_outlined,
                label: 'Precio inicial',
                value: _formatMoney(auction.startingPrice),
              ),
              _InfoRow(
                icon: Icons.trending_up,
                label: 'Incremento mínimo',
                value: _formatMoney(auction.incrementAmount),
              ),
              _InfoRow(
                icon: Icons.vertical_align_top,
                label: 'Precio máximo',
                value: _formatMoney(auction.maxBidAmount),
              ),
              _InfoRow(
                icon: Icons.category_outlined,
                label: 'Tipo',
                value: auction.type == 'express'
                    ? 'Express'
                    : 'Estándar',
              ),
              _InfoRow(
                icon: Icons.info_outline,
                label: 'Estado',
                value: _statusLabel,
              ),
              const SizedBox(height: 24),
              Text(
                'Descripción del producto',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                auction.product.description?.trim().isNotEmpty == true
                    ? auction.product.description!
                    : 'Este producto no cuenta con una descripción.',
                style: theme.textTheme.bodyLarge?.copyWith(
                  height: 1.6,
                  color: theme.colorScheme.onSurface
                      .withValues(alpha: 0.75),
                ),
              ),
              const SizedBox(height: 28),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.gavel_outlined,
                      color: _brandColor,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'La participación y validación de pujas '
                        'se realizan de acuerdo con las reglas '
                        'establecidas por Puchale+.',
                        style: theme.textTheme.bodySmall?.copyWith(
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ]),
          ),
        ),
      ],
    );
  }
}

class _Gallery extends StatefulWidget {
  final List<dynamic> images;

  const _Gallery({
    required this.images,
  });

  @override
  State<_Gallery> createState() => _GalleryState();
}

class _GalleryState extends State<_Gallery> {
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
                      ? const Color(0xFFA3FF00)
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

class _PriceCard extends StatelessWidget {
  final String currentPrice;
  final String increment;

  const _PriceCard({
    required this.currentPrice,
    required this.increment,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF1B1B1B),
            Color(0xFF303030),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: const Color(0xFFA3FF00)
              .withValues(alpha: 0.25),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'PRECIO ACTUAL',
            style: theme.textTheme.labelLarge?.copyWith(
              color: Colors.white70,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            currentPrice,
            style: theme.textTheme.headlineMedium?.copyWith(
              color: const Color(0xFFA3FF00),
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              const Icon(
                Icons.trending_up,
                color: Color(0xFFA3FF00),
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Incremento: $increment',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(
            icon,
            size: 21,
            color: const Color(0xFFA3FF00),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface
                    .withValues(alpha: 0.65),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;

  const _Chip({
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: color,
        ),
      ),
    );
  }
}
