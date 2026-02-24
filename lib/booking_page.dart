import 'dart:ui';

import 'package:flutter/material.dart';

class BookingPage extends StatefulWidget {
  const BookingPage({super.key});

  @override
  State<BookingPage> createState() => _BookingPageState();
}

class _BookingPageState extends State<BookingPage> {
  String _selectedRoom = 'Sala grande';

  final List<_RoomOption> _rooms = const [
    _RoomOption(
      name: 'Sala piccola',
      icon: Icons.meeting_room_outlined,
      subtitle: 'Sessioni rapide / prove singole',
      accent: Color(0xFF5A4A43),
    ),
    _RoomOption(
      name: 'Sala grande',
      icon: Icons.domain_rounded,
      subtitle: 'Band complete / prove estese',
      accent: Color(0xFFE26A2B),
    ),
    _RoomOption(
      name: 'Sala registrazione',
      icon: Icons.mic_external_on_outlined,
      subtitle: 'Recording e setup audio dedicato',
      accent: Color(0xFF8B4F35),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Prenotazione')),
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
              top: -24,
              right: -18,
              child: _BgGlow(size: 180, color: Color(0xFFE26A2B)),
            ),
            const Positioned(
              bottom: 30,
              left: -34,
              child: _BgGlow(size: 210, color: Color(0xFF5C4A42)),
            ),
            ListView(
              padding: const EdgeInsets.fromLTRB(16, 18, 16, 24),
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF332E30).withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.06),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Seleziona una sala',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Scegli la sala per iniziare la prenotazione (mock).',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.72),
                          fontSize: 13.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                for (var i = 0; i < _rooms.length; i++) ...[
                  _AnimatedRoomTile(
                    delayMs: 80 + (i * 70),
                    child: _RoomCard(
                      room: _rooms[i],
                      selected: _selectedRoom == _rooms[i].name,
                      onTap: () =>
                          setState(() => _selectedRoom = _rooms[i].name),
                    ),
                  ),
                  if (i < _rooms.length - 1) const SizedBox(height: 12),
                ],
                const SizedBox(height: 16),
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE26A2B),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content:
                              Text('Sala selezionata: $_selectedRoom (mock)'),
                        ),
                      );
                    },
                    child: const Text('Continua'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RoomCard extends StatelessWidget {
  const _RoomCard({
    required this.room,
    required this.selected,
    required this.onTap,
  });

  final _RoomOption room;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final borderColor = selected
        ? const Color(0xFFE26A2B)
        : Colors.white.withValues(alpha: 0.08);

    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(24),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Ink(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF332E30).withValues(alpha: 0.94),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: borderColor, width: selected ? 1.6 : 1),
            boxShadow: [
              if (selected)
                BoxShadow(
                  color: const Color(0xFFE26A2B).withValues(alpha: 0.12),
                  blurRadius: 22,
                  offset: const Offset(0, 10),
                ),
            ],
          ),
          child: Row(
            children: [
              Container(
                width: 66,
                height: 66,
                decoration: BoxDecoration(
                  color: room.accent.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(20),
                  border:
                      Border.all(color: room.accent.withValues(alpha: 0.26)),
                ),
                child: Icon(room.icon, color: Colors.white, size: 30),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      room.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      room.subtitle,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.72),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: selected
                      ? const Color(0xFFE26A2B)
                      : Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: selected
                        ? const Color(0xFFE26A2B)
                        : Colors.white.withValues(alpha: 0.12),
                  ),
                ),
                child: selected
                    ? const Icon(Icons.check_rounded,
                        color: Colors.white, size: 16)
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AnimatedRoomTile extends StatelessWidget {
  const _AnimatedRoomTile({required this.child, required this.delayMs});

  final Widget child;
  final int delayMs;

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 420 + delayMs),
      curve: Curves.easeOutCubic,
      builder: (context, t, _) {
        return Opacity(
          opacity: t,
          child: Transform.translate(
            offset: Offset(0, lerpDouble(14, 0, t)!),
            child: child,
          ),
        );
      },
    );
  }
}

class _RoomOption {
  const _RoomOption({
    required this.name,
    required this.icon,
    required this.subtitle,
    required this.accent,
  });

  final String name;
  final IconData icon;
  final String subtitle;
  final Color accent;
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
