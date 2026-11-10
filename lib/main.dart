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
              // Ignore non-main frame minor resource errors
              if (error.isForMainFrame ?? false) {
                setState(() {
                  _errorMessage = 'Could not load desk: ${error.description}';
                  _isLoading = false;
                });
              }
            },
            onNavigationRequest: (NavigationRequest request) {
              final uri = Uri.parse(request.url);
              // Allow local server navigation and duel URLs
              if (uri.host == '127.0.0.1' || uri.host == 'localhost' || uri.host == 'www.penfight.xyz') {
                return NavigationDecision.navigate;
              }
              // External links open in device browser
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
    if (message.startsWith('share:')) {
      final url = message.substring(6);
      launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    }
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
