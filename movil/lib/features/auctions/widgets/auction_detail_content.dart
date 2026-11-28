
import 'package:flutter/material.dart';

import '../models/auction_model.dart';
import 'common/auction_info_row.dart';
import 'detail/auction_gallery.dart';
import 'detail/auction_header.dart';
import 'detail/auction_price_card.dart';

class AuctionDetailContent extends StatelessWidget {
  final AuctionModel auction;
  final Widget biddingSection;

  const AuctionDetailContent({
    super.key,
    required this.auction,
    required this.biddingSection,
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
          child: AuctionGallery(images: images),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              AuctionHeader(
                title: auction.product.title,
                condition: auction.product.condition,
                auctionType: auction.type,
                statusLabel: _statusLabel,
                statusColor: _statusColor,
              ),

              const SizedBox(height: 24),

              AuctionPriceCard(
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

              AuctionInfoRow(
                icon: Icons.price_change_outlined,
                label: 'Precio inicial',
                value: _formatMoney(auction.startingPrice),
              ),

              AuctionInfoRow(
                icon: Icons.trending_up,
                label: 'Incremento mínimo',
                value: _formatMoney(auction.incrementAmount),
              ),

              AuctionInfoRow(
                icon: Icons.vertical_align_top,
                label: 'Precio máximo',
                value: _formatMoney(auction.maxBidAmount),
              ),

              AuctionInfoRow(
                icon: Icons.category_outlined,
                label: 'Tipo',
                value: auction.type == 'express'
                    ? 'Express'
                    : 'Estándar',
              ),

              AuctionInfoRow(
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

              const SizedBox(height: 28),

              biddingSection,
            ]),
          ),
        ),
      ],
    );
  }
}
