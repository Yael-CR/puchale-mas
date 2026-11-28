
import 'package:flutter/material.dart';

import '../../models/auction_bid_model.dart';
import 'auction_bid_item.dart';

class AuctionBidHistory extends StatelessWidget {
  final List<AuctionBidModel> bids;
  final String? currentUserId;
  final String currency;
  final bool isLoading;
  final String? error;
  final Future<void> Function() onRefresh;

  const AuctionBidHistory({
    super.key,
    required this.bids,
    required this.currentUserId,
    required this.currency,
    required this.isLoading,
    required this.error,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Historial de pujas',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
            if (bids.isNotEmpty)
              Text(
                '${bids.length} pujas',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurface.withValues(
                    alpha: 0.6,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),

        if (isLoading && bids.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: CircularProgressIndicator(),
            ),
          )
        else if (error != null && bids.isEmpty)
          _HistoryMessage(
            icon: Icons.wifi_off_outlined,
            message: error!,
            actionLabel: 'Reintentar',
            onAction: onRefresh,
          )
        else if (bids.isEmpty)
          const _HistoryMessage(
            icon: Icons.gavel_outlined,
            message: 'Todavía no hay pujas en esta subasta.',
          )
        else ...[
          if (error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                'No se pudo actualizar el historial. '
                'Se muestran las pujas disponibles.',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: Colors.orange,
                ),
              ),
            ),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: bids.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final bid = bids[index];

              return AuctionBidItem(
                bid: bid,
                currency: currency,
                isOwnBid: currentUserId != null &&
                    bid.bidderId == currentUserId,
              );
            },
          ),
          if (isLoading)
            const Padding(
              padding: EdgeInsets.only(top: 16),
              child: Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
              ),
            ),
        ],
      ],
    );
  }
}

class _HistoryMessage extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? actionLabel;
  final Future<void> Function()? onAction;

  const _HistoryMessage({
    required this.icon,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 20,
        vertical: 28,
      ),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 32,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
          ),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
            ),
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 12),
            TextButton(
              onPressed: onAction,
              child: Text(actionLabel!),
            ),
          ],
        ],
      ),
    );
  }
}
