import 'dart:io';
import 'package:flutter/services.dart';

class LocalAssetServer {
  HttpServer? _server;
  int? get port => _server?.port;

  Future<int> start() async {
    _server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    _server!.listen(_handleRequest);
    return _server!.port;
  }

  void stop() {
    _server?.close(force: true);
    _server = null;
  }

  Future<void> _handleRequest(HttpRequest request) async {
    final path = request.uri.path;
    String assetPath;

    if (path == '/' || path.isEmpty) {
      assetPath = 'assets/web/index.html';
    } else {
      final cleanPath = path.startsWith('/') ? path.substring(1) : path;
      assetPath = 'assets/web/$cleanPath';
    }

    try {
      final byteData = await _loadAssetWithFallback(assetPath);
      final bytes = byteData.buffer.asUint8List(
        byteData.offsetInBytes,
        byteData.lengthInBytes,
      );

      request.response.headers.set('Access-Control-Allow-Origin', '*');
      request.response.headers.set('Cache-Control', 'no-cache');
      request.response.headers.contentType = _getContentType(assetPath);
      request.response.statusCode = HttpStatus.ok;
      request.response.add(bytes);
      await request.response.close();
    } catch (e) {
      // If file not found in subfolder, check index.html for SPA routing
      if (!path.contains('.')) {
        try {
          final indexData = await rootBundle.load('assets/web/index.html');
          final bytes = indexData.buffer.asUint8List();
          request.response.headers.set('Access-Control-Allow-Origin', '*');
          request.response.headers.contentType = ContentType.html;
          request.response.statusCode = HttpStatus.ok;
          request.response.add(bytes);
          await request.response.close();
          return;
        } catch (_) {}
      }

      request.response.statusCode = HttpStatus.notFound;
      request.response.write('Not found: $path');
      await request.response.close();
    }
  }

  Future<ByteData> _loadAssetWithFallback(String path) async {
    try {
      return await rootBundle.load(path);
    } catch (_) {
      // Try alternative prefixes
      if (path.contains('/assets/')) {
        final stripped = path.replaceFirst('/assets/', '/');
        return await rootBundle.load(stripped);
      } else {
        final withAssets = path.replaceFirst('assets/web/', 'assets/web/assets/');
        return await rootBundle.load(withAssets);
      }
    }
  }

  ContentType _getContentType(String path) {
    final lower = path.toLowerCase();
    if (lower.endsWith('.html')) return ContentType.html;
    if (lower.endsWith('.js') || lower.endsWith('.mjs')) {
      return ContentType('application', 'javascript', charset: 'utf-8');
    }
    if (lower.endsWith('.css')) {
      return ContentType('text', 'css', charset: 'utf-8');
    }
    if (lower.endsWith('.json') || lower.endsWith('.webmanifest')) {
      return ContentType.json;
    }
    if (lower.endsWith('.woff2')) return ContentType('font', 'woff2');
    if (lower.endsWith('.woff')) return ContentType('font', 'woff');
    if (lower.endsWith('.png')) return ContentType('image', 'png');
    if (lower.endsWith('.webp')) return ContentType('image', 'webp');
    if (lower.endsWith('.mp3')) return ContentType('audio', 'mpeg');
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return ContentType('image', 'jpeg');
    }
    if (lower.endsWith('.svg')) return ContentType('image', 'svg+xml');
    if (lower.endsWith('.wasm')) return ContentType('application', 'wasm');
    return ContentType.binary;
  }
}
