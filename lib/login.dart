import 'dart:ui';

import 'package:flutter/material.dart';

import 'app_transitions.dart';
import 'home_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage>
    with SingleTickerProviderStateMixin {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final FocusNode _usernameFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();
  AnimationController? _logoAnimationController;
  bool _isPasswordVisible = false;
  bool _isAnyFieldFocused = false;

  InputDecoration _inputDecoration({
    required String label,
    required String hint,
    Widget? suffixIcon,
  }) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(20),
      borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.12)),
    );

    return InputDecoration(
      labelText: label,
      hintText: hint,
      labelStyle: TextStyle(color: Colors.white.withValues(alpha: 0.9)),
      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.45)),
      filled: true,
      fillColor: const Color(0xFF3A3437).withValues(alpha: 0.92),
      border: border,
      enabledBorder: border,
      focusedBorder: border.copyWith(
        borderSide: const BorderSide(color: Color(0xFFE26A2B), width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      suffixIcon: suffixIcon,
    );
  }

  void _handleFocusChange() {
    final hasFocus = _usernameFocusNode.hasFocus || _passwordFocusNode.hasFocus;
    if (hasFocus != _isAnyFieldFocused) {
      setState(() => _isAnyFieldFocused = hasFocus);
    }
  }

  AnimationController get _safeLogoAnimationController {
    return _logoAnimationController ??= AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    )..repeat(reverse: true);
  }

  double get _ambientT =>
      Curves.easeInOut.transform(_safeLogoAnimationController.value);

  void _goToHomePage() {
    FocusScope.of(context).unfocus();
    Navigator.of(context)
        .pushReplacement(fluidPageRoute(page: const HomePage()));
  }

  @override
  void initState() {
    super.initState();
    _safeLogoAnimationController;
    _usernameFocusNode.addListener(_handleFocusChange);
    _passwordFocusNode.addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _usernameFocusNode.dispose();
    _passwordFocusNode.dispose();
    _logoAnimationController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Stack(
        fit: StackFit.expand,
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF2D282A), Color(0xFF241F21)],
              ),
            ),
            child: Stack(
              children: const [
                Positioned(
                  top: -40,
                  right: -30,
                  child: _BlurBgBlob(size: 180, color: Color(0xFFE26A2B)),
                ),
                Positioned(
                  bottom: 40,
                  left: -20,
                  child: _BlurBgBlob(size: 220, color: Color(0xFF5A4B44)),
                ),
              ],
            ),
          ),
          IgnorePointer(
            ignoring: true,
            child: AnimatedOpacity(
              opacity: _isAnyFieldFocused ? 1 : 0,
              duration: const Duration(milliseconds: 220),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
                child: Container(color: Colors.black.withValues(alpha: 0.14)),
              ),
            ),
          ),
          Center(
            child: AnimatedBuilder(
              animation: _safeLogoAnimationController,
              builder: (context, child) {
                final ambientDy = lerpDouble(0, 4, _ambientT)!;
                final ambientScale = lerpDouble(1, 1.008, _ambientT)!;

                return Transform.translate(
                  offset: Offset(0, ambientDy),
                  child: Transform.scale(scale: ambientScale, child: child),
                );
              },
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: AnimatedScale(
                    scale: _isAnyFieldFocused ? 1.01 : 1,
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOut,
                    child: Material(
                      elevation: 10,
                      color: const Color(0xFF332E30).withValues(alpha: 0.94),
                      borderRadius: BorderRadius.circular(24),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            TextField(
                              controller: _usernameController,
                              focusNode: _usernameFocusNode,
                              keyboardType: TextInputType.emailAddress,
                              style: const TextStyle(color: Colors.white),
                              cursorColor: const Color(0xFFE26A2B),
                              decoration: _inputDecoration(
                                label: 'Username o Email',
                                hint: 'Inserisci username o email',
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _passwordController,
                              focusNode: _passwordFocusNode,
                              obscureText: !_isPasswordVisible,
                              style: const TextStyle(color: Colors.white),
                              cursorColor: const Color(0xFFE26A2B),
                              decoration: _inputDecoration(
                                label: 'Password',
                                hint: 'Inserisci password',
                                suffixIcon: IconButton(
                                  tooltip: _isPasswordVisible
                                      ? 'Nascondi password'
                                      : 'Mostra password',
                                  icon: Icon(
                                    _isPasswordVisible
                                        ? Icons.visibility_off
                                        : Icons.visibility,
                                    color: Colors.white.withValues(alpha: 0.85),
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _isPasswordVisible = !_isPasswordVisible;
                                    });
                                  },
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              height: 50,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFE26A2B),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                ),
                                onPressed: _goToHomePage,
                                child: const Text('Accedi'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: IgnorePointer(
              child: Align(
                alignment: const Alignment(0, -0.62),
                child: AnimatedBuilder(
                  animation: _safeLogoAnimationController,
                  builder: (context, child) {
                    final t = _ambientT;
                    final dy = lerpDouble(0, -8, t)!;
                    final scale = lerpDouble(1, 1.03, t)!;

                    return Transform.translate(
                      offset: Offset(0, dy),
                      child: Transform.scale(
                        scale: scale,
                        child: Opacity(
                          opacity: _isAnyFieldFocused ? 0.92 : 1,
                          child: child,
                        ),
                      ),
                    );
                  },
                  child: Container(
                    width: 160,
                    height: 160,
                    decoration: BoxDecoration(
                      color: const Color(0xFF3A3437).withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color:
                              const Color(0xFFE26A2B).withValues(alpha: 0.18),
                          blurRadius: 28,
                          offset: Offset(0, 10),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Image.asset(
                      'assets/brand/LOGO_Ca_Vaina/CAVAINA_LOGO_BADGE.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BlurBgBlob extends StatelessWidget {
  const _BlurBgBlob({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.24),
        borderRadius: BorderRadius.circular(size),
      ),
    );
  }
}
