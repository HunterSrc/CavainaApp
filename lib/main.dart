import 'package:flutter/material.dart';

void main() {
  runApp(const CavainaApp());
}

class CavainaApp extends StatelessWidget {
  const CavainaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CavainaApp',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('CavainaApp')),
      body: const Center(
        child: Text('Progetto Flutter inizializzato con successo.'),
      ),
    );
  }
}
