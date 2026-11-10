import 'package:flutter/material.dart';

enum ModType { none, coin1Rupee, coin2Rupee, rubberGrip, metalClip }

class ModSpec {
  final ModType type;
  final String name;
  final String description;
  final double massMultiplier;
  final double frictionMultiplier;
  final double restitutionMultiplier;
  final Color badgeColor;

  const ModSpec({
    required this.type,
    required this.name,
    required this.description,
    required this.massMultiplier,
    required this.frictionMultiplier,
    required this.restitutionMultiplier,
    required this.badgeColor,
  });
}

class PenModRegistry {
  static const List<ModSpec> availableMods = [
    ModSpec(
      type: ModType.none,
      name: 'Stock Build',
      description: 'Factory balance. No modifications attached.',
      massMultiplier: 1.0,
      frictionMultiplier: 1.0,
      restitutionMultiplier: 1.0,
      badgeColor: Color(0xFF8D6E63),
    ),
    ModSpec(
      type: ModType.coin1Rupee,
      name: '1₹ Coin on Cap',
      description: 'Classic school mod. Adds momentum to knock heavy pens off.',
      massMultiplier: 1.25,
      frictionMultiplier: 0.95,
      restitutionMultiplier: 1.10,
      badgeColor: Color(0xFFC4691A),
    ),
    ModSpec(
      type: ModType.coin2Rupee,
      name: '2₹ Heavy Coin',
      description: 'Maximum mass impact. Resists being pushed back.',
      massMultiplier: 1.45,
      frictionMultiplier: 1.15,
      restitutionMultiplier: 0.85,
      badgeColor: Color(0xFFD4AF37),
    ),
    ModSpec(
      type: ModType.rubberGrip,
      name: 'Double Rubber Grip',
      description: 'Stops dead on desk landing. Eliminates accidental self-falls.',
      massMultiplier: 1.05,
      frictionMultiplier: 1.40,
      restitutionMultiplier: 0.80,
      badgeColor: Color(0xFF2E7D32),
    ),
    ModSpec(
      type: ModType.metalClip,
      name: 'Reinforced Steel Clip',
      description: 'Generates angular spin on off-center flicks.',
      massMultiplier: 1.10,
      frictionMultiplier: 1.05,
      restitutionMultiplier: 1.25,
      badgeColor: Color(0xFF1976D2),
    ),
  ];

  static ModSpec getSpec(ModType type) {
    return availableMods.firstWhere((m) => m.type == type, orElse: () => availableMods.first);
  }
}
