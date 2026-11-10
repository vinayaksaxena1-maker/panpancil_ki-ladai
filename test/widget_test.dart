import 'package:flutter_test/flutter_test.dart';
import 'package:penfight/main.dart';

void main() {
  testWidgets('PenFightApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const PenFightApp());
    expect(find.text('PEN FIGHT'), findsOneWidget);
  });
}
