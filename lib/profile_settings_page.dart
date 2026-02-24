import 'dart:ui';

import 'package:flutter/material.dart';

class ProfileSettingsPage extends StatefulWidget {
  const ProfileSettingsPage({super.key});

  @override
  State<ProfileSettingsPage> createState() => _ProfileSettingsPageState();
}

class _ProfileSettingsPageState extends State<ProfileSettingsPage> {
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController(text: 'Marco');
  final _surnameController = TextEditingController(text: 'Rossi');
  final _bandGenreController = TextEditingController(text: 'Rock Alternativo');
  final _bandNameController = TextEditingController(text: 'Cavaina Project');
  final _phoneController = TextEditingController(text: '+39 333 123 4567');
  final _emailController = TextEditingController(text: 'marco@cavaina.it');

  InputDecoration _decoration(String label, {IconData? icon}) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(18),
      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.10)),
    );
    return InputDecoration(
      labelText: label,
      labelStyle: TextStyle(color: Colors.white.withValues(alpha: 0.9)),
      filled: true,
      fillColor: const Color(0xFF3A3437).withValues(alpha: 0.92),
      prefixIcon: icon == null
          ? null
          : Icon(icon, color: const Color(0xFFE26A2B), size: 20),
      border: border,
      enabledBorder: border,
      focusedBorder: border.copyWith(
        borderSide: const BorderSide(color: Color(0xFFE26A2B), width: 1.8),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _surnameController.dispose();
    _bandGenreController.dispose();
    _bandNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _save() {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Profilo salvato (mock)')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Impostazioni Profilo')),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF2D282A), Color(0xFF221E20)],
          ),
        ),
        child: Stack(
          children: [
            const Positioned(
              top: -20,
              right: -20,
              child: _BgGlow(size: 180, color: Color(0xFFE26A2B)),
            ),
            const Positioned(
              bottom: 20,
              left: -30,
              child: _BgGlow(size: 210, color: Color(0xFF5C4A42)),
            ),
            SafeArea(
              child: Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
                  children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0, end: 1),
                      duration: const Duration(milliseconds: 500),
                      curve: Curves.easeOutCubic,
                      builder: (context, t, child) => Opacity(
                        opacity: t,
                        child: Transform.translate(
                          offset: Offset(0, lerpDouble(12, 0, t)!),
                          child: child,
                        ),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color:
                              const Color(0xFF332E30).withValues(alpha: 0.95),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.06),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Dati profilo',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Compila o aggiorna le informazioni principali.',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.72),
                                fontSize: 13.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    _AnimatedField(
                      delay: 80,
                      child: TextFormField(
                        controller: _nameController,
                        style: const TextStyle(color: Colors.white),
                        cursorColor: const Color(0xFFE26A2B),
                        decoration:
                            _decoration('Nome', icon: Icons.person_outline),
                        validator: (v) => (v == null || v.trim().isEmpty)
                            ? 'Inserisci il nome'
                            : null,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _AnimatedField(
                      delay: 120,
                      child: TextFormField(
                        controller: _surnameController,
                        style: const TextStyle(color: Colors.white),
                        cursorColor: const Color(0xFFE26A2B),
                        decoration:
                            _decoration('Cognome', icon: Icons.badge_outlined),
                        validator: (v) => (v == null || v.trim().isEmpty)
                            ? 'Inserisci il cognome'
                            : null,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _AnimatedField(
                      delay: 160,
                      child: TextFormField(
                        controller: _bandGenreController,
                        style: const TextStyle(color: Colors.white),
                        cursorColor: const Color(0xFFE26A2B),
                        decoration: _decoration(
                          'Genere Band',
                          icon: Icons.music_note_outlined,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _AnimatedField(
                      delay: 200,
                      child: TextFormField(
                        controller: _bandNameController,
                        style: const TextStyle(color: Colors.white),
                        cursorColor: const Color(0xFFE26A2B),
                        decoration: _decoration(
                          'Nome Band',
                          icon: Icons.groups_2_outlined,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _AnimatedField(
                      delay: 240,
                      child: TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: Colors.white),
                        cursorColor: const Color(0xFFE26A2B),
                        decoration: _decoration(
                          'Numero di telefono',
                          icon: Icons.phone_outlined,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    _AnimatedField(
                      delay: 280,
                      child: TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        style: const TextStyle(color: Colors.white),
                        cursorColor: const Color(0xFFE26A2B),
                        decoration:
                            _decoration('Email', icon: Icons.mail_outline),
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'Inserisci l’email';
                          }
                          if (!v.contains('@')) return 'Email non valida';
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(height: 18),
                    _AnimatedField(
                      delay: 320,
                      child: SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE26A2B),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                          onPressed: _save,
                          child: const Text('Salva impostazioni'),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AnimatedField extends StatelessWidget {
  const _AnimatedField({required this.child, required this.delay});

  final Widget child;
  final int delay;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 420 + delay),
      curve: Curves.easeOutCubic,
      builder: (context, t, _) => Opacity(
        opacity: t,
        child: Transform.translate(
          offset: Offset(0, lerpDouble(14, 0, t)!),
          child: child,
        ),
      ),
    );
  }
}

class _BgGlow extends StatelessWidget {
  const _BgGlow({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return ImageFiltered(
      imageFilter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.22),
          borderRadius: BorderRadius.circular(size),
        ),
      ),
    );
  }
}
