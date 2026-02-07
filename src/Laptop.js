import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

export function Laptop({ open, hinge, ...props }) {
  const group = useRef(null)
  const { viewport, mouse } = useThree()
  const { scene } = useGLTF('/mac-draco.glb')
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  useFrame((state, delta) => {
    if (!group.current) return

    const t = state.clock.getElapsedTime()

    // Текущая idle-анимация
    const idleX = open ? Math.cos(t / 10) / 10 + 0.25 : 0
    const idleY = open ? Math.sin(t / 10) / 4 : 0
    const idleZ = open ? Math.sin(t / 10) / 10 : 0
    const idlePosY = open ? (-2 + Math.sin(t)) / 3 : -4.3

    // Курсор в диапазоне [-1..1]
    const mx = mouse.x
    const my = mouse.y

    // Максимальные углы поворота от курсора
    const maxX = 0.25  // наклон вверх/вниз
    const maxY = 0.5   // поворот влево/вправо

    // Целевые углы от мыши
    const lookX = -my * maxX
    const lookY = mx * maxY

    // Смешиваем idle + look-at
    const targetX = idleX + lookX
    const targetY = idleY + lookY
    const targetZ = idleZ

    // Плавное приближение (damping)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4, delta)
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetZ, 4, delta)

    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, idlePosY, 4, delta)
  })

  return (
    <group
      ref={group}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}
      dispose={null}
    >
      <primitive {...props} object={scene} />
    </group>
  )
}
