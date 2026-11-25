
import 'package:flutter/foundation.dart';

class HomeViewModel extends ChangeNotifier {
  int _selectedTabIndex = 0;

  int get selectedTabIndex => _selectedTabIndex;

  void selectTab(int index) {
    if (index == _selectedTabIndex) return;

    _selectedTabIndex = index;
    notifyListeners();
  }
}
