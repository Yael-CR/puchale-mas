
import 'package:flutter/material.dart';

import '../common/auction_status_chip.dart';

class AuctionHeader extends StatelessWidget {
  final String title;
  final String? condition;
  final String auctionType;
  final String statusLabel;
  final Color statusColor;

  const AuctionHeader({
    super.key,
    required this.title,
    required this.condition,
    required this.auctionType,
    required this.statusLabel,
    required this.statusColor,
  });

  static const Color _brandColor = Color(0xFFA3FF00);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            AuctionStatusChip(
              label: auctionType == 'express'
                  ? 'SUBASTA EXPRESS'
                  : 'SUBASTA ESTÁNDAR',
              color: _brandColor,
            ),
            AuctionStatusChip(
              label: statusLabel.toUpperCase(),
              color: statusColor,
            ),
          ],
        ),

        const SizedBox(height: 18),

        Text(
          title,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.w800,
          ),
        ),

        if (condition != null && condition!.isNotEmpty) ...[
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
                condition!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurface
                      .withValues(alpha: 0.65),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
