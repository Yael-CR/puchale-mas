
import 'package:go_router/go_router.dart';

import '../../features/auctions/views/auction_detail_view.dart';
import '../../features/home/views/home_view.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomeView(),
      ),
      GoRoute(
        path: '/subastas/:auctionId',
        name: 'auction-detail',
        builder: (context, state) {
          final auctionId = state.pathParameters['auctionId']!;

          return AuctionDetailView(
            auctionId: auctionId,
          );
        },
      ),
    ],
  );
}
