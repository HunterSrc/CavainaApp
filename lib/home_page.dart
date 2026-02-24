import 'dart:ui';

import 'package:flutter/material.dart';

import 'app_transitions.dart';
import 'booking_page.dart';
import 'profile_settings_page.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
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
              child: _BgOrb(size: 180, color: Color(0xFFE26A2B)),
            ),
            const Positioned(
              bottom: 30,
              left: -40,
              child: _BgOrb(size: 220, color: Color(0xFF5C4A42)),
            ),
            ListView(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
              children: [
                const _NextAppointmentCard(),
                const SizedBox(height: 24),
                const Text(
                  'Benvenuto',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.6,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Seleziona una sezione per iniziare.',
                  style: TextStyle(fontSize: 15, color: Color(0xCFFFFFFF)),
                ),
                const SizedBox(height: 20),
                _FeatureTile(
                  title: 'Prenotazioni',
                  subtitle: 'Gestione appuntamenti e disponibilità',
                  icon: Icons.calendar_month_rounded,
                  colorA: const Color(0xFFE26A2B),
                  colorB: const Color(0xFFBF531B),
                  onTap: () {
                    Navigator.of(
                      context,
                    ).push(fluidPageRoute(page: const BookingPage()));
                  },
                ),
                const SizedBox(height: 16),
                _FeatureTile(
                  title: 'Profilo Cliente',
                  subtitle: 'Dati, storico e preferenze',
                  icon: Icons.badge_rounded,
                  colorA: Color(0xFF433B3E),
                  colorB: Color(0xFF342F31),
                  onTap: () {
                    Navigator.of(context).push(
                      fluidPageRoute(page: const ProfileSettingsPage()),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureTile extends StatelessWidget {
  const _FeatureTile({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.colorA,
    required this.colorB,
    this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color colorA;
  final Color colorB;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(28),
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: onTap,
        child: Ink(
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: [colorA, colorB]),
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: colorA.withValues(alpha: 0.22),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(18),
                    border:
                        Border.all(color: Colors.white.withValues(alpha: 0.18)),
                  ),
                  child: Icon(icon, color: Colors.white, size: 30),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 13.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Colors.white.withValues(alpha: 0.9),
                  size: 18,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NextAppointmentCard extends StatefulWidget {
  const _NextAppointmentCard();

  @override
  State<_NextAppointmentCard> createState() => _NextAppointmentCardState();
}

class _NextAppointmentCardState extends State<_NextAppointmentCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 650),
      curve: Curves.easeOutCubic,
      builder: (context, intro, _) {
        final yIn = lerpDouble(12, 0, intro)!;

        return AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final t = Curves.easeInOut.transform(_controller.value);
            final floatY = lerpDouble(0, -3, t)!;

            return Opacity(
              opacity: intro,
              child: Transform.translate(
                offset: Offset(0, yIn + floatY),
                child: child,
              ),
            );
          },
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF332E30).withValues(alpha: 0.96),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFE26A2B).withValues(alpha: 0.10),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 124,
                  height: 96,
                  decoration: BoxDecoration(
                    color: const Color(0xFF3A3437),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFFE26A2B).withValues(alpha: 0.22),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 10,
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '24 FEB',
                        style: TextStyle(
                          color: Color(0xFFE26A2B),
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.6,
                        ),
                      ),
                      Spacer(),
                      Text(
                        'Sala A',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Prossimo appuntamento',
                        style: TextStyle(
                          color: Color(0xB3FFFFFF),
                          fontSize: 12.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        '09:30',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.8,
                        ),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Mock • Controllo prenotazione',
                        style: TextStyle(
                          color: Color(0x99FFFFFF),
                          fontSize: 12.5,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _BgOrb extends StatelessWidget {
  const _BgOrb({required this.size, required this.color});

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
