import 'package:cavaina_app/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Mostra i campi login', (WidgetTester tester) async {
    await tester.pumpWidget(const CavainaApp());

    expect(find.text('Login'), findsOneWidget);
    expect(find.text('Username o Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Accedi'), findsOneWidget);
  });

  testWidgets('La password può essere resa visibile con il toggle',
      (WidgetTester tester) async {
    await tester.pumpWidget(const CavainaApp());

    final passwordField = find.byWidgetPredicate(
      (widget) => widget is TextField && widget.decoration?.labelText == 'Password',
    );

    TextField initialTextField = tester.widget<TextField>(passwordField);
    expect(initialTextField.obscureText, isTrue);

    await tester.tap(find.byIcon(Icons.visibility));
    await tester.pump();

    TextField toggledTextField = tester.widget<TextField>(passwordField);
    expect(toggledTextField.obscureText, isFalse);
  });
}
