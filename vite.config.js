import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// vite.config.js
// import basicSsl from '@vitejs/plugin-basic-ssl'
import { viteStaticCopy } from 'vite-plugin-static-copy';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js',
          dest: './'
        },
        {
          src: 'node_modules/@ricky0123/vad-web/dist/silero_vad.onnx',
          dest: './'
        },
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: './'
        }
      ]
    })
    ,react()
    // ,basicSsl({
    //   /** name of certification */
    //   name: 'test',
    //   /** custom trust domains */
    //   domains: ['localhost'],
    //   /** custom certification directory */
    //   certDir: '/tmp/cert'
    // })
  ],
  server: {
	  port: 3000,
  },
  build: {
    outDir: './docs'
  }
})
 