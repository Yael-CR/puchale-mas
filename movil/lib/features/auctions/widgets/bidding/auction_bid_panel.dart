
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../viewmodels/auction_bidding_viewmodel.dart';

class AuctionBidPanel extends StatelessWidget {
  const AuctionBidPanel({super.key});

  static const Color _brandColor = Color(0xFFA3FF00);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Consumer<AuctionBiddingViewModel>(
      builder: (context, viewModel, child) {
        final isPending = viewModel.isBidPending;
        final isProcessing = viewModel.isSubmittingBid;

        String buttonText;

        if (isProcessing && viewModel.bidRequestId == null) {
          buttonText = 'Enviando solicitud...';
        } else if (viewModel.bidRequestStatus == 'queued') {
          buttonText = 'En cola...';
        } else if (viewModel.bidRequestStatus == 'processing') {
          buttonText = 'Procesando puja...';
        } else {
          buttonText = 'Pujar ahora';
        }

        IconData buttonIcon = Icons.gavel;

        if (viewModel.bidAccepted) {
          buttonIcon = Icons.check_circle_outline;
        } else if (viewModel.bidRejected) {
          buttonIcon = Icons.cancel_outlined;
        } else if (viewModel.bidExpired) {
          buttonIcon = Icons.timer_off_outlined;
        }

        Color messageColor = theme.colorScheme.onSurface;

        if (viewModel.bidAccepted) {
          messageColor = Colors.green;
        } else if (viewModel.bidRejected || viewModel.bidExpired) {
          messageColor = theme.colorScheme.error;
        }

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.gavel,
                      color: _brandColor,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Participar en la subasta',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                FilledButton.icon(
                  onPressed: viewModel.canSubmitBid
                      ? viewModel.submitBid
                      : null,
                  icon: isProcessing && !isPending
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                          ),
                        )
                      : Icon(buttonIcon),
                  label: Text(buttonText),
                  style: FilledButton.styleFrom(
                    backgroundColor: _brandColor,
                    foregroundColor: Colors.black,
                    disabledBackgroundColor:
                        theme.colorScheme.surfaceContainerHighest,
                    disabledForegroundColor:
                        theme.colorScheme.onSurfaceVariant,
                    padding: const EdgeInsets.symmetric(
                      vertical: 15,
                    ),
                  ),
                ),

                if (viewModel.bidMessage != null) ...[
                  const SizedBox(height: 14),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        buttonIcon,
                        size: 20,
                        color: messageColor,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          viewModel.bidMessage!,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: messageColor,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],

                if (isPending && !isProcessing) ...[
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: viewModel.checkBidRequestStatus,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Consultar estado'),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
