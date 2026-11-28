
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../models/auction_model.dart';

class AuctionCard extends StatelessWidget {
  final AuctionModel auction;

  const AuctionCard({
    super.key,
    required this.auction,
  });

  static const Color _brandColor = Color(0xFFA3FF00);

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

  String get _typeLabel {
    return auction.type == 'express' ? 'Express' : 'Estándar';
  }

  String _formatMoney(double amount) {
    return '\$${amount.toStringAsFixed(2)} ${auction.currency}';
  }

  @override
  Widget build(BuildContext context) {
    final images = [...auction.product.images]
      ..sort((a, b) => a.position.compareTo(b.position));

    final imageUrl = images.isNotEmpty ? images.first.url : null;

    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () {
        context.push('/subastas/${auction.id}');
      },
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: theme.dividerColor.withValues(alpha: 0.15),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ProductImage(imageUrl: imageUrl),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        _InfoChip(
                          label: _typeLabel,
                          color: _brandColor,
                        ),
                        _InfoChip(
                          label: _statusLabel,
                          color: _statusColor,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      auction.product.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (auction.product.condition != null &&
                        auction.product.condition!.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        auction.product.condition!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    Text(
                      'Precio actual',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurface
                            .withValues(alpha: 0.6),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      _formatMoney(auction.currentPrice),
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: _brandColor,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'Incremento: ${_formatMoney(auction.incrementAmount)}',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ProductImage extends StatelessWidget {
  final String? imageUrl;

  const _ProductImage({
    required this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(13),
      child: SizedBox(
        width: 112,
        height: 132,
        child: imageUrl != null && imageUrl!.isNotEmpty
            ? Image.network(
                imageUrl!,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => _placeholder(context),
              )
            : _placeholder(context),
      ),
    );
  }

  Widget _placeholder(BuildContext context) {
    return Container(
      color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.06),
      child: Icon(
        Icons.inventory_2_outlined,
        size: 38,
        color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final Color color;

  const _InfoChip({
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
