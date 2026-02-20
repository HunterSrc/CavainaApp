import 'package:flutter_test/flutter_test.dart';
import 'package:cavaina_app/main.dart';

void main() {
  testWidgets('Mostra il messaggio di inizializzazione', (WidgetTester tester) async {
    await tester.pumpWidget(const CavainaApp());

    expect(find.text('Progetto Flutter inizializzato con successo.'), findsOneWidget);
  });
}
