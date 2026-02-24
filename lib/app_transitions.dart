import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';

PageRouteBuilder<T> fluidPageRoute<T>({
  required Widget page,
  Color accent = const Color(0xFFE26A2B),
}) {
  return PageRouteBuilder<T>(
    transitionDuration: const Duration(milliseconds: 820),
    reverseTransitionDuration: const Duration(milliseconds: 520),
    pageBuilder: (_, __, ___) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.easeInCubic,
      );
      final spring = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutBack,
        reverseCurve: Curves.easeInBack,
      );

      return AnimatedBuilder(
        animation: animation,
        builder: (context, _) {
          final t = curved.value;
          final springT = spring.value;
          final blur = lerpDouble(18, 0, t)!;
          final slideY = lerpDouble(0.10, 0.0, t)!;
          final scale = lerpDouble(0.93, 1.0, springT)!;
          final rotate = lerpDouble(0.025, 0.0, t)!;
          final wave = math.sin(t * math.pi * 2.2) * (1 - t) * 6;

          final blobOpacity = (1 - (t - 0.55).clamp(0, 1)).toDouble() * 0.22;

          return Stack(
            fit: StackFit.expand,
            children: [
              FadeTransition(
                opacity: Tween<double>(begin: 0, end: 1).animate(curved),
                child: ImageFiltered(
                  imageFilter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
                  child: Transform.translate(
                    offset: Offset(
                        0, MediaQuery.sizeOf(context).height * slideY + wave),
                    child: Transform.rotate(
                      angle: rotate,
                      child: Transform.scale(scale: scale, child: child),
                    ),
                  ),
                ),
              ),
              IgnorePointer(
                child: Opacity(
                  opacity: blobOpacity,
                  child: Stack(
                    children: [
                      Positioned(
                        left: lerpDouble(-120, 40, t)!,
                        top: lerpDouble(
                          MediaQuery.sizeOf(context).height * 0.65,
                          MediaQuery.sizeOf(context).height * 0.25,
                          t,
                        )!,
                        child: _TransitionBlob(
                          size: lerpDouble(180, 260, t)!,
                          color: accent,
                        ),
                      ),
                      Positioned(
                        right: lerpDouble(-100, 20, t)!,
                        top: lerpDouble(
                          MediaQuery.sizeOf(context).height * 0.10,
                          MediaQuery.sizeOf(context).height * 0.42,
                          t,
                        )!,
                        child: _TransitionBlob(
                          size: lerpDouble(140, 220, t)!,
                          color: accent.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      );
    },
  );
}

class _TransitionBlob extends StatelessWidget {
  const _TransitionBlob({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return ImageFiltered(
      imageFilter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(size),
        ),
      ),
    );
  }
}
