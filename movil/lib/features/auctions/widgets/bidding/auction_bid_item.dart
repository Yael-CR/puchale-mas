
import 'package:flutter/material.dart';

import '../../models/auction_bid_model.dart';

class AuctionBidItem extends StatelessWidget {
  final AuctionBidModel bid;
  final bool isOwnBid;
  final String currency;

  const AuctionBidItem({
    super.key,
    required this.bid,
    required this.isOwnBid,
    required this.currency,
  });

  static const Color _brandColor = Color(0xFFA3FF00);

  String _formatTime(DateTime dateTime) {
    final localDate = dateTime.toLocal();
    final hour = localDate.hour.toString().padLeft(2, '0');
    final minute = localDate.minute.toString().padLeft(2, '0');

    return '$hour:$minute';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isOwnBid
            ? _brandColor.withValues(alpha: 0.07)
            : theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOwnBid
              ? _brandColor.withValues(alpha: 0.35)
              : theme.dividerColor.withValues(alpha: 0.15),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isOwnBid
                  ? _brandColor.withValues(alpha: 0.15)
                  : theme.colorScheme.onSurface.withValues(alpha: 0.06),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isOwnBid ? Icons.person : Icons.gavel_outlined,
              color: isOwnBid
                  ? _brandColor
                  : theme.colorScheme.onSurface.withValues(alpha: 0.65),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isOwnBid ? 'Tu puja' : 'Participante',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Puja #${bid.sequenceNo} · ${_formatTime(bid.acceptedAt)}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(
                      alpha: 0.55,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '\$${bid.amount.toStringAsFixed(2)} $currency',
            textAlign: TextAlign.end,
            style: theme.textTheme.titleSmall?.copyWith(
              color: isOwnBid ? _brandColor : theme.colorScheme.onSurface,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
