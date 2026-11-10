import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'local_asset_server.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const PenFightApp());
}

class PenFightApp extends StatelessWidget {
  const PenFightApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pen Fight',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF1A140E),
        primaryColor: const Color(0xFFC4691A),
        fontFamily: 'sans-serif',
      ),
      home: const PenFightShell(),
    );
  }
}

class PenFightShell extends StatefulWidget {
  const PenFightShell({super.key});

  @override
  State<PenFightShell> createState() => _PenFightShellState();
}

class _PenFightShellState extends State<PenFightShell> {
  final LocalAssetServer _server = LocalAssetServer();
  WebViewController? _controller;
  bool _isLoading = true;
  String? _errorMessage;
  bool _hapticsEnabled = true;

  @override
  void initState() {
    super.initState();
    _initGameEngine();
  }

  Future<void> _initGameEngine() async {
    try {
      final port = await _server.start();
      final localUrl = 'http://127.0.0.1:$port/';

      final controller = WebViewController()
        ..setJavaScriptMode(JavaScriptMode.unrestricted)
        ..setBackgroundColor(const Color(0xFF1A140E))
        ..addJavaScriptChannel(
          '__pfNativeBridge',
          onMessageReceived: (JavaScriptMessage message) {
            _handleNativeMessage(message.message);
          },
        )
        ..setNavigationDelegate(
          NavigationDelegate(
            onPageStarted: (String url) {
              setState(() {
                _isLoading = true;
                _errorMessage = null;
              });
            },
            onPageFinished: (String url) {
              setState(() {
                _isLoading = false;
              });
            },
            onWebResourceError: (WebResourceError error) {
              if (error.isForMainFrame ?? false) {
                setState(() {
                  _errorMessage = 'Could not load desk: ${error.description}';
                  _isLoading = false;
                });
              }
            },
            onNavigationRequest: (NavigationRequest request) {
              final uri = Uri.parse(request.url);
              if (uri.host == '127.0.0.1' || uri.host == 'localhost' || uri.host == 'www.penfight.xyz') {
                return NavigationDecision.navigate;
              }
              launchUrl(uri, mode: LaunchMode.externalApplication);
              return NavigationDecision.prevent;
            },
          ),
        );

      await controller.loadRequest(Uri.parse(localUrl));

      if (mounted) {
        setState(() {
          _controller = controller;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Initialization failed: $e';
          _isLoading = false;
        });
      }
    }
  }

  void _handleNativeMessage(String message) {
    if (message.startsWith('haptic:')) {
      if (!_hapticsEnabled) return;
      final type = message.substring(7);
      if (type == 'heavy') {
        HapticFeedback.heavyImpact();
      } else if (type == 'medium') {
        HapticFeedback.mediumImpact();
      } else {
        HapticFeedback.lightImpact();
      }
    } else if (message.startsWith('share:')) {
      final url = message.substring(6);
      launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
  }

  void _openNativeSettingsSheet() {
    HapticFeedback.selectionClick();
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF261D15),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Desk Settings',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFF3EDE0),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.greenAccent, width: 1),
                        ),
                        child: const Text(
                          'Offline 100%',
                          style: TextStyle(color: Colors.greenAccent, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SwitchListTile(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Haptic Vibration (Impact Feel)'),
                    subtitle: const Text('Vibrates on pen collision and desk flicks'),
                    activeTrackColor: const Color(0xFFC4691A),
                    value: _hapticsEnabled,
                    onChanged: (val) {
                      setModalState(() => _hapticsEnabled = val);
                      setState(() => _hapticsEnabled = val);
                      if (val) HapticFeedback.heavyImpact();
                    },
                  ),
                  const Divider(color: Color(0xFF4A3B2C)),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.rule, color: Color(0xFFD4A373)),
                    title: const Text('Classic Rules'),
                    subtitle: const Text('Best of 5 rounds • Knock opponent pen off the desk'),
                    onTap: () {
                      Navigator.pop(ctx);
                      _showRulesDialog();
                    },
                  ),
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.refresh, color: Color(0xFFD4A373)),
                    title: const Text('Reset Desk'),
                    subtitle: const Text('Reload table physics and positions'),
                    onTap: () {
                      Navigator.pop(ctx);
                      _controller?.reload();
                    },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showRulesDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF261D15),
        title: const Text('Pen Fight Rules', style: TextStyle(color: Color(0xFFF3EDE0))),
        content: const Text(
          '1. Two pens on the desk. You take turns flicking.\n'
          '2. Knock the opponent\'s pen off the desk edge to score a point.\n'
          '3. If your own pen falls off, it counts as a foul.\n'
          '4. First player to score 3 rounds wins the match and claims the pen!',
          style: TextStyle(color: Color(0xFFD4A373), height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Got it', style: TextStyle(color: Color(0xFFC4691A))),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _server.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF1A140E),
      body: SafeArea(
        top: false,
        bottom: false,
        child: Stack(
          children: [
            if (_controller != null)
              WebViewWidget(controller: _controller!),
            // Floating Native HUD Pill (Webview Spam Immunity)
            Positioned(
              top: MediaQuery.of(context).padding.top + 8,
              right: 12,
              child: GestureDetector(
                onTap: _openNativeSettingsSheet,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF261D15).withValues(alpha: 0.85),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFC4691A), width: 1.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.tune, size: 16, color: Color(0xFFF3EDE0)),
                      SizedBox(width: 4),
                      Text(
                        'Desk',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFF3EDE0),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (_isLoading)
              Container(
                color: const Color(0xFF1A140E),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF261D15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFC4691A), width: 1.5),
                        ),
                        child: Column(
                          children: const [
                            Text(
                              'PEN FIGHT',
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 3,
                                color: Color(0xFFF3EDE0),
                              ),
                            ),
                            SizedBox(height: 6),
                            Text(
                              'Finding your seat at the last bench...',
                              style: TextStyle(
                                fontSize: 14,
                                fontStyle: FontStyle.italic,
                                color: Color(0xFFD4A373),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      const SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Color(0xFFC4691A),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            if (_errorMessage != null)
              Center(
                child: Container(
                  margin: const EdgeInsets.all(24),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF261D15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.redAccent),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, color: Colors.redAccent, size: 40),
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Color(0xFFF3EDE0)),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFC4691A),
                        ),
                        onPressed: () {
                          _initGameEngine();
                        },
                        child: const Text('Retry'),
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
