
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../data/repositories/auction_repository.dart';
import '../viewmodels/auction_detail_viewmodel.dart';
import '../viewmodels/auction_bidding_viewmodel.dart';
import '../widgets/auction_detail_content.dart';
import '../widgets/bidding/auction_bid_history.dart';

class AuctionDetailView extends StatelessWidget {
  final String auctionId;

  const AuctionDetailView({
    super.key,
    required this.auctionId,
  });

  @override
  Widget build(BuildContext context) {
    final repository = context.read<AuctionRepository>();
    final supabase = context.read<SupabaseClient>();

    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuctionDetailViewModel>(
          create: (_) => AuctionDetailViewModel(
            repository,
            auctionId,
          )..loadAuction(),
        ),
        ChangeNotifierProvider<AuctionBiddingViewModel>(
          create: (_) => AuctionBiddingViewModel(
            repository: repository,
            supabase: supabase,
            auctionId: auctionId,
          )..initialize(),
        ),
      ],
      child: const _AuctionDetailBody(),
    );
  }
}

class _AuctionDetailBody extends StatelessWidget {
  const _AuctionDetailBody();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de subasta'),
      ),
      body: Consumer<AuctionDetailViewModel>(
        builder: (context, detailViewModel, child) {
          if (detailViewModel.isLoading &&
              detailViewModel.auction == null) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (detailViewModel.error != null &&
              detailViewModel.auction == null) {
            return _ErrorView(
              message: detailViewModel.error!,
              onRetry: detailViewModel.retry,
            );
          }

          if (detailViewModel.auction == null) {
            return const Center(
              child: Text('No se encontró la subasta.'),
            );
          }

          final auction = detailViewModel.auction!;

          return Consumer<AuctionBiddingViewModel>(
            builder: (context, biddingViewModel, child) {
              return AuctionDetailContent(
                auction: auction,
                biddingSection: AuctionBidHistory(
                  bids: biddingViewModel.bids,
                  currentUserId: biddingViewModel.currentUserId,
                  currency: auction.currency,
                  isLoading: biddingViewModel.historyLoading,
                  error: biddingViewModel.historyError,
                  onRefresh: biddingViewModel.refreshHistory,
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.cloud_off_outlined,
              size: 56,
              color: Colors.redAccent,
            ),
            const SizedBox(height: 16),
            Text(
              'No fue posible cargar la subasta',
              style: theme.textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 10),
            Text(
              message,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}
